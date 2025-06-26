/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type Nullable from '../common/Nullable'
import type Bounding from '../common/Bounding'
import { isFunction, isNumber, isString } from '../common/utils/typeChecks'
import type TimeWeightTick from '../common/TimeWeightTick'
import { calcBetweenTimeWeightTickBarCount, classifyTimeWeightTicks, createTimeWeightTickList, TimeWeightConstants } from '../common/TimeWeightTick'
import { FormatDateType } from '../Options'
import type { KLineData } from '../common/Data'

import AxisImp, { type AxisTemplate, type Axis, type AxisRange, type AxisTick } from './Axis'

import type DrawPane from '../pane/DrawPane'

export type XAxisTemplate = Pick<AxisTemplate, 'name' | 'scrollZoomEnabled' | 'createTicks'>

export interface XAxis extends Axis, Required<XAxisTemplate> {
  convertTimestampFromPixel: (pixel: number) => Nullable<number>
  convertTimestampToPixel: (timestamp: number) => number
}

export type XAxisConstructor = new (parent: DrawPane) => XAxis

export default abstract class XAxisImp extends AxisImp implements XAxis {
  constructor (parent: DrawPane, xAxis: XAxisTemplate) {
    super(parent)
    this.override(xAxis)
  }

  override (xAxis: XAxisTemplate): void {
    const {
      name,
      scrollZoomEnabled,
      createTicks
    } = xAxis
    if (!isString(this.name)) {
      this.name = name
    }
    this.scrollZoomEnabled = scrollZoomEnabled ?? this.scrollZoomEnabled
    this.createTicks = createTicks ?? this.createTicks
  }

  protected override createRangeImp (): AxisRange {
    const chartStore = this.getParent().getChart().getChartStore()
    const visibleDataRange = chartStore.getVisibleRange()
    const { realFrom, realTo } = visibleDataRange
    const af = realFrom
    const at = realTo
    const diff = realTo - realFrom + 1
    const range = {
      from: af,
      to: at,
      range: diff,
      realFrom: af,
      realTo: at,
      realRange: diff,
      displayFrom: af,
      displayTo: at,
      displayRange: diff
    }
    return range
  }

  protected override createTicksImp (): AxisTick[] {
    const { realFrom, realTo } = this.getRange()
    const chartStore = this.getParent().getChart().getChartStore()
    const formatDate = chartStore.getCustomApi().formatDate
    const timeWeightTickList = chartStore.getTimeWeightTickList()
    const ticks: AxisTick[] = []

    const fitTicks: ((list: TimeWeightTick[], start: number) => void) = (list, start) => {
      for (const timeWeightTick of list) {
        if (timeWeightTick.dataIndex >= start && timeWeightTick.dataIndex < realTo) {
          const { timestamp, weight, dataIndex } = timeWeightTick
          let text = ''
          switch (weight) {
            case TimeWeightConstants.Year: {
              text = formatDate(timestamp, 'YYYY', FormatDateType.XAxis)
              break
            }
            case TimeWeightConstants.Month: {
              text = formatDate(timestamp, 'YYYY-MM', FormatDateType.XAxis)
              break
            }
            case TimeWeightConstants.Day: {
              text = formatDate(timestamp, 'MM-DD', FormatDateType.XAxis)
              break
            }
            case TimeWeightConstants.Hour:
            case TimeWeightConstants.Minute: {
              text = formatDate(timestamp, 'HH:mm', FormatDateType.XAxis)
              break
            }
            case TimeWeightConstants.Second: {
              text = formatDate(timestamp, 'HH:mm:ss', FormatDateType.XAxis)
              break
            }
            default: {
              text = formatDate(timestamp, 'YYYY-MM-DD HH:mm', FormatDateType.XAxis)
              break
            }
          }
          ticks.push({
            coord: this.convertToPixel(dataIndex),
            value: timestamp,
            text
          })
        }
      }
    }

    fitTicks(timeWeightTickList, realFrom)

    // Future time tick
    if (timeWeightTickList.length > 0) {
      const barSpace = chartStore.getBarSpace().bar
      const textStyles = chartStore.getStyles().xAxis.tickText
      const barCount = calcBetweenTimeWeightTickBarCount(barSpace, textStyles)
      const startDataIndex = timeWeightTickList[timeWeightTickList.length - 1].dataIndex + barCount - 1
      const dataList: Array<Pick<KLineData, 'timestamp'>> = []
      for (let i = startDataIndex; i < realTo; i++) {
        const timestamp = chartStore.dataIndexToTimestamp(i)
        if (isNumber(timestamp)) {
          dataList.push({ timestamp })
        }
      }

      if (dataList.length > 0) {
        const map = new Map<number, TimeWeightTick[]>()
        classifyTimeWeightTicks(map, dataList, chartStore.getDateTimeFormat(), startDataIndex)
        fitTicks(createTimeWeightTickList(map, barSpace, textStyles), startDataIndex)
      }
    }

    if (isFunction(this.createTicks)) {
      return this.createTicks({
        range: this.getRange(),
        bounding: this.getBounding(),
        defaultTicks: ticks
      })
    }
    return ticks
  }

  override getAutoSize (): number {
    const styles = this.getParent().getChart().getStyles()
    const xAxisStyles = styles.xAxis
    const height = xAxisStyles.size
    if (height !== 'auto') {
      return height
    }
    const crosshairStyles = styles.crosshair
    let xAxisHeight = 0
    if (xAxisStyles.show) {
      if (xAxisStyles.axisLine.show) {
        xAxisHeight += xAxisStyles.axisLine.size
      }
      if (xAxisStyles.tickLine.show) {
        xAxisHeight += xAxisStyles.tickLine.length
      }
      if (xAxisStyles.tickText.show) {
        xAxisHeight += (xAxisStyles.tickText.marginStart + xAxisStyles.tickText.marginEnd + xAxisStyles.tickText.size)
      }
    }
    let crosshairVerticalTextHeight = 0
    if (
      crosshairStyles.show &&
      crosshairStyles.vertical.show &&
      crosshairStyles.vertical.text.show
    ) {
      crosshairVerticalTextHeight += (
        crosshairStyles.vertical.text.paddingTop +
        crosshairStyles.vertical.text.paddingBottom +
        crosshairStyles.vertical.text.borderSize * 2 +
        crosshairStyles.vertical.text.size
      )
    }
    return Math.max(xAxisHeight, crosshairVerticalTextHeight)
  }

  protected override getBounding (): Bounding {
    return this.getParent().getMainWidget().getBounding()
  }

  convertTimestampFromPixel (pixel: number): Nullable<number> {
    const chartStore = this.getParent().getChart().getChartStore()
    const dataIndex = chartStore.coordinateToDataIndex(pixel)
    return chartStore.dataIndexToTimestamp(dataIndex)
  }

  convertTimestampToPixel (timestamp: number): number {
    const chartStore = this.getParent().getChart().getChartStore()
    const dataIndex = chartStore.timestampToDataIndex(timestamp)
    return chartStore.dataIndexToCoordinate(dataIndex)
  }

  convertFromPixel (pixel: number): number {
    return this.getParent().getChart().getChartStore().coordinateToDataIndex(pixel)
  }

  convertToPixel (value: number): number {
    return this.getParent().getChart().getChartStore().dataIndexToCoordinate(value)
  }

  static extend (template: XAxisTemplate): XAxisConstructor {
    class Custom extends XAxisImp {
      constructor (parent: DrawPane) {
        super(parent, template)
      }
    }
    return Custom
  }
}
