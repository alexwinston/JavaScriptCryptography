<template functional>
  <div>
    <!-- Isomorphs Header -->
    <table class="header gaps" style="margin: 15px 0px 0px 0px;">
      <tr>
        <td class="gap-counts" style="vertical-align: text-top;">Isomorphs:</td>
        <td>
          <span class="monospace">length</span>
        </td>
        <td class="gap-counts" style="padding-right: 3px;">
          <button class="btn btn-toggle monospace" v-on:click="analysis.isomorphs_max_length.add(-1)">-</button>
          <span class="">{{ analysis.isomorphs_max_length.get() }}</span>
          <button class="btn monospace" v-on:click="analysis.isomorphs_max_length.add(1)">+</button>
        </td>
        <td>
          <span class="monospace">pairs</span>
        </td>
        <td class="gap-counts" style="padding-right: 3px;">
          <button class="btn btn-toggle monospace" v-on:click="analysis.isomorphs_min_pairs.add(-1)">-</button>
          <span class="">{{ analysis.isomorphs_min_pairs.get() }}</span>
          <button class="btn monospace" v-on:click="analysis.isomorphs_min_pairs.add(1)">+</button>
        </td>
        <td>
          <span class="monospace">count</span>
        </td>
        <td class="gap-counts" style="padding-right: 3px;">
          <button class="btn btn-toggle monospace" v-on:click="analysis.isomorphs_min_count.add(-1)">-</button>
          <span class="">{{ analysis.isomorphs_min_count.get() }}</span>
          <button class="btn monospace" v-on:click="analysis.isomorphs_min_count.add(1)">+</button>
        </td>
        <td style="vertical-align: middle; padding-left: 5px;">
          <input v-model="analysis.isomorphs_fit_length.value" style="margin: 0px -1px 1px 0px;" type="checkbox">
        </td>
        <td>
          <span class="monospace">fit</span>
        </td>
      </tr>
    </table>
    <!-- Isomorphs -->
    <div class="messages">
      <table>
        <tr v-for="(message, i) in analysis.messages">
          <td class="monospace message-count">
            {{ message.length }}
          </td>
          <td v-for="(c, j) in message" class="monospace" :style="{ backgroundColor: analysis.isomorph_color(i, j) }">
            {{ c }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
module.exports = {
  props: {
    analysis: Analysis
  }
}
</script>
