<script>
  import Airquality from "./lib/Airquality.svelte";
  import Biketraffic from "./lib/Biketraffic.svelte";
  import Cartraffic from "./lib/Cartraffic.svelte";
  import Pedestrians from "./lib/Pedestrians.svelte";
  import Header from "./lib/Header.svelte";
  import Footer from "./lib/Footer.svelte";

  export let target;
  const mode = target.dataset.outputmode;
  //console.log(target.dataset.outputmode);

  const airChartData =
    "https://cdn.faz-azure.com/multimediaredaktion/RM_Dashboard/luftindex.json?sv=2020-10-02&st=2022-07-07T19%3A02%3A35Z&se=2222-07-08T19%3A02%3A00Z&sr=c&sp=r&sig=nrn9mbdYgd9tqIUMSSZ7P8RIaG1z%2BOBPyqC%2FTwRf7u0%3D";

  const bikeDataConfig = {
    chartdataUrl:
      "https://cdn.faz-azure.com/multimediaredaktion/RM_Dashboard/bikes_woche.json?sv=2020-10-02&st=2022-07-07T19%3A02%3A35Z&se=2222-07-08T19%3A02%3A00Z&sr=c&sp=r&sig=nrn9mbdYgd9tqIUMSSZ7P8RIaG1z%2BOBPyqC%2FTwRf7u0%3D",
    chartdataKeys: [0, 2, 4],
    chartdataLegend: "Vorjahreswert",
  };

  const pedestrianDataConfig = {
    chartdataUrl:
      "https://cdn.faz-azure.com/multimediaredaktion/RM_Dashboard/pedestrians_widget.json?sv=2020-10-02&st=2022-07-07T19%3A02%3A35Z&se=2222-07-08T19%3A02%3A00Z&sr=c&sp=r&sig=nrn9mbdYgd9tqIUMSSZ7P8RIaG1z%2BOBPyqC%2FTwRf7u0%3D",
    chartdataKeys: [0, 1, 2],
    chartdataLegend: "Jahresdurchschnittswert",
  };

  const carDataConfig = {
    chartdataUrl:
      "https://cdn.faz-azure.com/multimediaredaktion/RM_Dashboard/traffic_today.json?sv=2020-10-02&st=2022-07-07T19%3A02%3A35Z&se=2222-07-08T19%3A02%3A00Z&sr=c&sp=r&sig=nrn9mbdYgd9tqIUMSSZ7P8RIaG1z%2BOBPyqC%2FTwRf7u0%3D",
    chartdataKeys: [0, 3, 4],
    chartdataLegend: "Jahresdurchschnittswert",
  };

  const airInfoHeadline = "Luftqualitätsindex";
  const airInfoText =
    "Der Index basiert auf der gesundheitlichen Bewertung von Ozon- und NO<sub>2</sub>- Stundenmittelwerten und stündlich gleitenden PM<sub>10</sub>- und PM<sub>2,5</sub>-Tagesmittelwerten. Für jeden Messwert haben wir den Durchschnitt der vier Stationen in Frankfurt berechnet. Die aktuellsten, stündlichen Schadstoffwerte der Stationen haben wir anhand der Schwellenwerte des Umweltbundesamtes kategorisiert. Der Schadstoff, der die schlechteste Luftqualität aufweist, bestimmt die Indexkategorie und -farbe. Die Verhaltensempfehlungen stammen ebenfalls vom Umweltbundesamt.";

  const bikeInfoHeadline = "Radverkehr";
  const bikeInfoText =
    "Hessen Mobil betreut als obere Landesbehörde das übergeordnete Straßennetz in Hessen und erhebt mit Dauerzählstellen Daten zum Radverkehr im ganzen Bundesland. In Frankfurt gibt es zehn solcher Zählstellen: an der Bockenheimer Landstraße (beidseitig), zweimal an der Friedberger Landstraße (jeweils beidseitig), am südlichen Mainkai/Schaumainkai (zwei Zählstellen) und am Niddaradweg. Der aktuellste Gesamtwert wird mit dem Gesamtwert des gleichen Wochentages im letzten Jahr verglichen. ";

  const carInfoHeadline = "Autoverkehr";
  const carInfoText =
    "Die Fahrzeiten basieren auf von TomTom erhobenen Floating Car Daten (FCD). Die Navigationsgeräte, In-Dash-Systeme und Apps senden in Echtzeit anonymisierte FCD-Daten an die Server, aus denen die Verkehrsinformationen abgeleitet werden. TomTom berechnet daraus unter anderem, wie viel Zeit Autofahrer für eine 10 Kilometer lange Strecke benötigen.";

  const pedInfoHeadline = "Passanten";
  const pedInfoText =
    "Die Passantendaten werden von hystreet.com zur Verfügung gestellt. Mit Laserscannern wird rund um die Uhr die Anzahl der Menschen gemessen, die diese Zählstellen passieren. In Frankfurt gibt es acht solcher Zählstellen: auf der Zeil, der Berger Straße, der Goethestraße, der Großen Bockenheimer Straße, der Königsteiner Straße, der Leipziger Straße, der Schweizer Straße und am Römerberg. Der aktuellste Gesamtwert wird mit dem Durchschnittswert des jeweiligen Wochentages in den letzten 365 Tagen verglichen.";
</script>

<main>
  {#if mode == "faznet"}
    <Header dataUrl={airChartData} appHeadline="Verkehr und Luftqualität in Frankfurt" {mode}></Header>
  {/if}

  <div class="vizcontainer">
    <div class="vizbox">
      <Pedestrians
        dataConfig={pedestrianDataConfig}
        chartHeadline="Passanten"
        chartIcon="pedestrians.svg"
        chartInfoHeadline={pedInfoHeadline}
        chartInfoText={pedInfoText}
      />
    </div>
    <div class="vizbox">
      <Biketraffic
        dataConfig={bikeDataConfig}
        chartHeadline="Radverkehr"
        chartIcon="biketraffic.svg"
        chartInfoHeadline={bikeInfoHeadline}
        chartInfoText={bikeInfoText}
      />
    </div>
    <div class="vizbox">
      <Cartraffic
        dataConfig={carDataConfig}
        chartHeadline="Autoverkehr"
        chartIcon="cartraffic.svg"
        chartInfoHeadline={carInfoHeadline}
        chartInfoText={carInfoText}
      />
    </div>
    <div class="vizbox">
      <Airquality
        chartdataUrl={airChartData}
        chartHeadline="Luftqualität"
        chartIcon="airquality.svg"
        chartInfoHeadline={airInfoHeadline}
        chartInfoText={airInfoText}
      />
    </div>
    <Footer dataUrl={airChartData} clickUrl="https://www.faz.net/1.9846546" clickText="Mehr lesen" {mode}></Footer>
  </div>
</main>
