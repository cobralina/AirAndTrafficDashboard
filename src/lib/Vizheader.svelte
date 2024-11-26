<script>
  export let chartHeadline = "";
  export let chartIcon = "";
  export let currentHeadline = "Current";
  export let currentSubline = "Subline";
  export let chartInfoHeadline = "Headline Infotext";
  export let chartInfoText = "Lorem Ipsum";

  let infoBoxVisible;

  function getInfoBox() {
    infoBoxVisible = !infoBoxVisible;
    let infobox = document.getElementById(chartHeadline);
    infobox.style.animation = "fadeIn 0.4s ease-in-out";
  }

  function closeInfoBox() {
    infoBoxVisible = !infoBoxVisible;
    let infobox = document.getElementById(chartHeadline);
    infobox.style.animation = "fadeOut 0.4s ease-in-out";
  }
</script>

<infobox id={chartHeadline} class:visible={infoBoxVisible}>
  <vizheader>
    <h2>{chartInfoHeadline}</h2>
    <button class="infoicon-button" on:click={closeInfoBox}>
      <img width="12px" height="12px" class="infoicon" src="img/close.svg" alt="Close-Icon" />
    </button></vizheader
  >
  <div class="infotext">
    {@html chartInfoText}
  </div>
</infobox>
<vizheader>
  <img class="vizicon" src={"img/" + chartIcon} alt={chartHeadline} />
  <h2>{chartHeadline}</h2>
  <button class="infoicon-button" on:click={getInfoBox}>
    <img class="infoicon" src="img/infoicon.svg" alt="Info-Icon" />
  </button>
</vizheader>
<currenthead>{currentHeadline}</currenthead>
<currentsub>{currentSubline}</currentsub>
