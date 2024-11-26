<script>
  import Vizheader from "./Vizheader.svelte";
  import TrafficChart from "./TrafficChart.svelte";
  export let chartHeadline = "";
  export let chartIcon = "";
  export let chartInfoText = "";
  export let chartInfoHeadline = "";

  export let dataConfig = {
    chartdataUrl: "",
    chartdataKeys: [0, 0, 0],
    chartdataLegend: "Vorjahreswert",
  };

  let currentHeadline = "";
  let currentSubline = "";

  function handleDataEvent(event) {
    //Daten von Child-Komponente, die die Daten fetched. Für Headline und Subline-Werte.
    const { current, compare } = event.detail;

    let dif = 0;
    currentHeadline = current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " Radfahrer";
    if (current > compare) {
      dif = Math.round(((current - compare) / current) * 100); // Prozentuale Differenz
      currentSubline = "Es ist " + dif + " % mehr los als letztes Jahr zu dieser Zeit.";
    } else if (current < compare) {
      dif = Math.round(((compare - current) / compare) * 100);
      currentSubline = "Es ist " + dif + " % weniger los als letztes Jahr zu dieser Zeit.";
    } else {
      currentSubline = "";
    }
  }
</script>

<Vizheader {chartHeadline} {chartIcon} {currentHeadline} {currentSubline} {chartInfoHeadline} {chartInfoText}
></Vizheader>
<TrafficChart
  on:dataEvent={handleDataEvent}
  chartdataConfig={dataConfig}
  chartID="bikechart"
  vizcolorCurrent="#613399"
  vizcolorDefault="#C6ADE4"
></TrafficChart>
<credits>Quelle: Hessen Mobil</credits>
