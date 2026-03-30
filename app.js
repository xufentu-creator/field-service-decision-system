function setLang() {
  const c = CONTENT[lang];

  if (document.getElementById("title")) {
    document.getElementById("title").innerText = c.home.title;
    document.getElementById("subtitle").innerText = c.home.subtitle;
    document.getElementById("startBtn").innerText = c.home.start;
    document.getElementById("principle").innerText = c.home.principle;
  }

  if (document.getElementById("uploadTitle")) {
    document.getElementById("uploadTitle").innerText = c.upload.title;
    document.getElementById("uploadSubtitle").innerText = c.upload.subtitle;
    document.getElementById("photoLabel").innerText = c.upload.photoLabel;
    document.getElementById("goalLabel").innerText = c.upload.goalLabel;
    document.getElementById("generateBtn").innerText = c.upload.generate;
  }

  if (document.getElementById("resultTitle")) {
    document.getElementById("resultTitle").innerText = c.result.title;
    document.getElementById("resultSubtitle").innerText = c.result.subtitle;
    document.getElementById("currentTitle").innerText = c.result.currentTitle;
    document.getElementById("currentDesc").innerText = c.result.currentDesc;
    document.getElementById("optionsIntro").innerText = c.result.optionsIntro;

    document.getElementById("optionATitle").innerText = c.result.optionA.title;
    document.getElementById("optionADesc1").innerText = c.result.optionA.desc1;
    document.getElementById("optionADesc2").innerText = c.result.optionA.desc2;
    document.getElementById("optionAPrice").innerText = c.result.optionA.price;
    document.getElementById("optionABtn").innerText = c.result.optionA.button;

    document.getElementById("optionBTitle").innerText = c.result.optionB.title;
    document.getElementById("optionBDesc1").innerText = c.result.optionB.desc1;
    document.getElementById("optionBDesc2").innerText = c.result.optionB.desc2;
    document.getElementById("optionBPrice").innerText = c.result.optionB.price;
    document.getElementById("optionBBtn").innerText = c.result.optionB.button;

    document.getElementById("optionCTitle").innerText = c.result.optionC.title;
    document.getElementById("optionCDesc1").innerText = c.result.optionC.desc1;
    document.getElementById("optionCDesc2").innerText = c.result.optionC.desc2;
    document.getElementById("optionCPrice").innerText = c.result.optionC.price;
    document.getElementById("optionCBtn").innerText = c.result.optionC.button;

    const storedImage = localStorage.getItem("uploadedImage");
    if (storedImage) {
      document.getElementById("currentImage").src = storedImage;
    }
  }
}

function goUpload() {
  window.location.href = "upload.html";
}

function generateOptions() {
  const fileInput = document.getElementById("photoInput");
  const userGoal = document.getElementById("userGoal").value.trim();

  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please upload a photo first.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    localStorage.setItem("uploadedImage", e.target.result);
    localStorage.setItem("userGoal", userGoal);
    window.location.href = "result.html";
  };

  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", function () {
  setLang();

  const fileInput = document.getElementById("photoInput");
  const previewImage = document.getElementById("previewImage");

  if (fileInput && previewImage) {
    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }
});
