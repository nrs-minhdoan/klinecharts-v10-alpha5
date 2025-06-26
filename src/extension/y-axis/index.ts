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

import YAxisImp, { type YAxisTemplate, type YAxisConstructor } from '../../component/YAxis'

import normal from './normal'
import percentage from './percentage'
import logarithm from './logarithm'

const yAxises: Record<string, YAxisConstructor> = {
  normal: YAxisImp.extend(normal),
  percentage: YAxisImp.extend(percentage),
  logarithm: YAxisImp.extend(logarithm)
}

function registerYAxis (axis: YAxisTemplate): void {
  yAxises[axis.name] = YAxisImp.extend(axis)
}

function getYAxisClass (name: string): YAxisConstructor {
  return yAxises[name] ?? yAxises.normal
}

export {
  registerYAxis,
  getYAxisClass
}
