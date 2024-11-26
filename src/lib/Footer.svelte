<script>
  export let clickUrl = "https://www.faz.net";
  export let clickText = "";
  export let mode = "faznet";
  export let dataUrl = "";

  import Header from "./Header.svelte";

  function handleClick() {
    window.top.location.href = clickUrl;
  }
</script>

{#if mode == "faznet"}
  <div class="footer">
    <button class="btn_teritary" on:click={handleClick}>{clickText}</button>
  </div>
{/if}

{#if mode == "story"}
  <Header {dataUrl} appHeadline="" {mode}></Header>
{/if}
