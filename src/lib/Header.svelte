<script>
  export let dataUrl = "";
  export let appHeadline = "";
  export let mode = "faznet";

  let originalDateString = "";
  let timestampApp = "";


  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  fetch(dataUrl)
    .then((response) => response.json())
    .then((data) => {
      originalDateString = data.Date;
      let originalDate = new Date(originalDateString);
      timestampApp = formatDate(originalDate);
    });

  // Funktion zur Formatierung des Datums
  function formatDate(date) {
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Formatierung der Stunden und Minuten auf zwei Stellen
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    // Rückgabe des formatierten Datums
    return `${day}. ${month} ${year}, ${hours}:${minutes} Uhr`;
  }

</script>


{#if mode == "faznet"}
  <div class="header">
    <h1>{appHeadline}</h1>
    <h2>Zuletzt aktualisiert: {timestampApp}</h2>
  </div>
{/if}

{#if mode == "story"}
<div style="color:var(--mm-grey-400)">Zuletzt aktualisiert: {timestampApp}</div>
{/if}
