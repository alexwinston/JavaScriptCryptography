<template functional>
    <div>
        <!-- Alignments Header -->
        <table class="header gaps" style="margin: 15px 0px 0px 0px;">
            <tr>
                <td class="gap-counts" style="vertical-align: text-top;">Alignments:</td>
                <td style="vertical-align: middle;">
                    <input v-model="analysis.alignment_unique.value" style="margin: 0px -1px 1px 0px;" type="checkbox">
                </td>
                <td>
                    <span class="monospace">unique</span>
                </td>
            </tr>
        </table>
        <!-- Alignments -->
        <div class="messages">
            <table>
                <tr v-for="(message, i) in analysis.messages">
                    <td class="monospace message-count">
                        {{ message.length }}
                    </td>
                    <td v-for="(c, j) in message" class="monospace"
                        :style="{ backgroundColor: analysis.alignment_color(i, j) }">
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