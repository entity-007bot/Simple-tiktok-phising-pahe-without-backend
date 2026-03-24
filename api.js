<script id="fakeapi">
// Fake API to transport submissions in real-time
const FakeAPI = (function() {
  const listeners = [];
  return {
    send(data) { listeners.forEach(cb => cb(data)); },
    subscribe(cb) { listeners.push(cb); }
  };
})();
</script>
