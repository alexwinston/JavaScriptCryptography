<template functional>
  <div>
    <!-- Gaps Header -->
    <table class="header gaps" style="margin:15px 0px 0px 0px;">
      <tr>
        <td class="gap-counts" style="vertical-align: text-top;">Gaps:</td>
        <td style="vertical-align: middle;">
          <input v-model="analysis.gaps_aligned.value" style="margin: 0px -1px 1px 0px;" type="checkbox">
        </td>
        <td>
          <span class="monospace">aligned</span>
        </td>
        <td style="vertical-align: middle;">
          <input v-model="analysis.gap_ends.value" style="margin: 0px -1px 1px 0px;" type="checkbox">
        </td>
        <td>
          <span class="monospace">ends</span>
        </td>
        <td class="gap-counts" style="padding-right: 3px;">
          <button class="btn btn-toggle monospace" v-on:click="analysis.gaps_min.add(-1)">-</button>
          <span class="">{{ analysis.gaps_min.get() }}</span>
          <button class="btn monospace" v-on:click="analysis.gaps_min.add(1)">+</button>
        </td>
        <td class="gap-counts" style="padding-right: 5px;">
          <button class="btn btn-toggle monospace" v-on:click="analysis.gaps_max.add(-1)">-</button>
          <span class="">{{ analysis.gaps_max.get() }}</span>
          <button class="btn monospace" v-on:click="analysis.gaps_max.add(1)">+</button>
          <button class="btn monospace" v-on:click="analysis.gaps_max.set(analysis.messages_max)">></button>
        </td>
        <td v-for="gap in analysis.gap_counts" class="gap-count">
          <span :style="{ backgroundColor: analysis.gap_color(gap[0]) }">{{ gap[0] }}</span>:<span>{{ gap[1] }}</span>
        </td>
      </tr>
    </table>
    <!-- Gaps -->
    <div class="messages">
      <table>
        <tr v-for="(message, i) in analysis.messages">
          <td class="monospace message-count">
            {{ message.length }}
          </td>
          <td v-for="(c, j) in message" class="monospace" :style="{ backgroundColor: analysis.gap_color(analysis.gap_length(i, j)) }">
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