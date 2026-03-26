async function uploadImage() {
  const file = document.getElementById("image").files[0];
  const loader = document.getElementById("loaderOverlay");
  const output = document.getElementById("output");

  if (!file) {
    alert("Please upload image");
    return;
  }

  output.innerHTML = "";
  loader.classList.remove("hidden");

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("https://ecom-gujju-ai-1.onrender.com", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    loader.classList.add("hidden");

    output.innerHTML = `
      <div class="bg-white/10 p-4 rounded-xl border border-white/20">
        <b class="text-blue-400">📌 Title</b><br>${data.title}
      </div>

      <div class="bg-white/10 p-4 rounded-xl border border-white/20">
        <b class="text-blue-400">📝 Description</b><br>${data.description}
      </div>

      <div class="bg-white/10 p-4 rounded-xl border border-white/20">
        <b class="text-blue-400">🔍 Keywords</b><br>${data.keywords}
      </div>
    `;

  } catch (err) {
    loader.classList.add("hidden");
    output.innerHTML = "❌ Error generating result";
  }
}
