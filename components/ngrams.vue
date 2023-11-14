<template functional>
    <div>
        <!-- Ngrams Header -->
    <table class="header gaps" style="margin: 15px 0px 0px 0px;">
      <tr>
        <td class="gap-counts" style="vertical-align: text-top;">Ngrams:</td>
        <td>
          <span class="monospace">length</span>
        </td>
        <td class="gap-counts" style="padding-right: 3px;">
          <button class="btn btn-toggle monospace" v-on:click="analysis.ngrams_length.add(-1)">-</button>
          <span class="">{{ analysis.ngrams_length.get() }}</span>
          <button class="btn monospace" v-on:click="analysis.ngrams_length.add(1)">+</button>
        </td>
        <td>
          <span class="monospace">min</span>
        </td>
        <td class="gap-counts" style="padding-right: 3px;">
          <button class="btn btn-toggle monospace" v-on:click="analysis.ngrams_min.add(-1)">-</button>
          <span class="">{{ analysis.ngrams_min.get() }}</span>
          <button class="btn monospace" v-on:click="analysis.ngrams_min.add(1)">+</button>
        </td>
      </tr>
    </table>
        <!-- Ngrams -->
        <div class="messages">
            <table>
                <tr v-for="(message, i) in analysis.messages">
                    <td class="monospace message-count">
                        {{ message.length }}
                    </td>
                    <td v-for="(c, j) in message" class="monospace"
                        :style="{ backgroundColor: analysis.ngram_color(i,j) }">
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