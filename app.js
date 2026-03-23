let lang = "en";

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
    document.getElementById("generateBtn").innerText = c.upload.generate;
  }

  // 结果页不要再用默认内容覆盖后端数据
  if (document.getElementById("resultTitle")) {
    if (!localStorage.getItem("optionsData")) {
      document.getElementById("resultTitle").innerText = c.result.title;
      document.getElementById("current").innerText = c.result.current;
      document.getElementById("optionA").innerText = c.result.optionA;
      document.getElementById("optionB").innerText = c.result.optionB;
      document.getElementById("optionC").innerText = c.result.optionC;
      document.getElementById("boundary").innerText = c.result.boundary;
    }
  }
}

function goUpload() {
  window.location.href = "upload.html";
}

async function goResult() {
  const currentIssue = document.getElementById("problemInput").value;
  const desiredResult = document.getElementById("goalInput").value;

  const response = await fetch("http://localhost:3000/api/generate-options", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      imageUrl: "",
      currentIssue,
      desiredResult,
      budgetPreference: "balanced",
      stylePreference: "clean"
    })
  });

  const data = await response.json();

  localStorage.setItem("optionsData", JSON.stringify(data));

  window.location.href = "result.html";
}

window.onload = setLang;
