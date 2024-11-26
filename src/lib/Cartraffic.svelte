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
    chartdataLegend: "Jahresdurchschnittswert",
  };

  let currentHeadline = "";
  let currentSubline = "";

  function handleDataEvent(event) {
    //Daten von Child-Komponente, die die Daten fetched. Für Headline und Subline-Werte.
    const { current, compare } = event.detail;

    let dif = convertDecimalToTime(0);
    currentHeadline = convertDecimalToTime(current) + " Minuten für 10 km";
    if (current > compare) {
      dif = convertDecimalToTime(current - compare);
      currentSubline = "Sie brauchen durchschnittlich " + dif + " Minuten länger.";
    } else if (current < compare) {
      dif = convertDecimalToTime(compare - current);
      currentSubline = "Sie brauchen durchschnittlich " + dif + " Minuten weniger.";
    } else {
      currentSubline = "Sie brauchen genauso lang wie gewöhnlich zu dieser Zeit.";
    }
  }

  function convertDecimalToTime(decimal) {
    // Formatierung der Uhrzeit
    const minutes = Math.floor(decimal);
    const seconds = Math.round((decimal - minutes) * 60);
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    return `${minutes}:${formattedSeconds}`;
  }
</script>

<Vizheader {chartHeadline} {chartIcon} {currentHeadline} {currentSubline} {chartInfoHeadline} {chartInfoText}
></Vizheader>
<TrafficChart
  on:dataEvent={handleDataEvent}
  chartdataConfig={dataConfig}
  chartID="carchart"
  vizcolorCurrent="#C24E0A"
  vizcolorDefault="#F8AE84"
></TrafficChart>
<credits>Quelle: TomTom</credits>
