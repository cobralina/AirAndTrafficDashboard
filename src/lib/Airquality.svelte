<script>
  import { onMount } from "svelte";
  import Vizheader from "./Vizheader.svelte";
  export let chartdataUrl = "";
  export let chartHeadline = "";
  export let chartIcon = "";
  export let chartInfoText = "";
  export let chartInfoHeadline = "";

  const airQualityText = {
    1: "Sehr schlecht",
    2: "Schlecht",
    3: "Mäßig",
    4: "Gut",
    5: "Sehr gut",
  };

  const airQualityInfo = {
    1: "Negative gesundheitliche Auswirkungen können auftreten. Wer empfindlich ist oder vorgeschädigte Atemwege hat, sollte körperliche Anstrengungen im Freien vermeiden.",
    2: "Bei empfindlichen Menschen können nachteilige gesundheitliche Wirkungen auftreten. Diese sollten körperlich anstrengende Tätigkeiten im Freien vermeiden. In Kombination mit weiteren Luftschadstoffen können auch weniger empfindliche Menschen auf die Luftbelastung reagieren.",
    3: "Kurzfristige nachteilige Auswirkungen auf die Gesundheit sind unwahrscheinlich. Allerdings können Effekte durch Luftschadstoffkombinationen und bei langfristiger Einwirkung des Einzelstoffes nicht ausgeschlossen werden. Zusätzliche Reize können die Wirkung der Luftschadstoffe verstärken, insbesondere für empfindliche Personengruppen.",
    4: "Genießen Sie Ihre Aktivitäten im Freien, gesundheitlich nachteilige Wirkungen sind nicht zu erwarten.",
    5: "Beste Voraussetzungen, um sich ausgiebig im Freien aufzuhalten.",
  };

  let airIndex = 1;
  let currentHeadText = "";
  let currentInfoText = "";

  onMount(() => {
    // Fetch Data
    fetch(chartdataUrl)
      .then((response) => response.json())
      .then((data) => {
        airIndex = data.worst_index;
        document.getElementById("slider").style.left = (110 - airIndex * 20).toString() + "%";
        currentHeadText = airQualityText[airIndex];
        currentInfoText = airQualityInfo[airIndex];
      })
      .catch((error) => console.error("Fehler beim Abrufen der Daten:", error));
  });
</script>

<Vizheader
  {chartHeadline}
  {chartIcon}
  currentHeadline={currentHeadText}
  currentSubline=""
  {chartInfoText}
  {chartInfoHeadline}
></Vizheader>
<airviz>
  <div class="multi-color-gradient">
    <div id="slider" class="slider-knob"></div>
  </div>
</airviz>

<p>
  <b>Verhaltensempfehlungen: </b><br />
  {currentInfoText}
</p>
<credits><div class="aircaption">Quelle: Umweltbundesamt</div> </credits>
