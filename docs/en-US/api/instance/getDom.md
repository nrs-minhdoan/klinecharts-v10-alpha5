---
outline: deep
---

# getDom(paneId?, position?)
`getDom` get the chart dom element.

## Reference {#reference}
<!-- @include: @/@views/api/references/instance/getDom.md -->

### Parameters {#parameters}
- `paneId` Pane id.
- `position` Position, supports `root`, `main` and `yAxis` .

### Returns {#returns}
`getDom` Returns an `HTMLElement` or `null` .

## Usage {#usage}
<script setup>
import GetDom from '../../../@views/api/samples/getDom/index.vue'
</script>

### Basic usage {#basic}
<GetDom/>