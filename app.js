let lang = "en";

function setLang() {
  if (typeof CONTENT === "undefined") return;
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
}

function goUpload() {
  window.location.href = "upload.html";
}

async function goResult() {
  const currentIssue = document.getElementById("problemInput")?.value || "";
  const desiredResult = document.getElementById("goalInput")?.value || "";

  try {
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
    localStorage.setItem(
      "userInputs",
      JSON.stringify({
        currentIssue,
        desiredResult
      })
    );

    window.location.href = "result.html";
  } catch (error) {
    alert("Failed to connect to backend. Please make sure backend is running on localhost:3000.");
    console.error(error);
  }
}

async function submitBooking() {
  const selectedOptionRaw = localStorage.getItem("selectedOption");
  const optionsDataRaw = localStorage.getItem("optionsData");

  if (!selectedOptionRaw || !optionsDataRaw) {
    document.getElementById("bookingMessage").innerText =
      "Missing selected option or request data.";
    return;
  }

  const selectedOption = JSON.parse(selectedOptionRaw);
  const optionsData = JSON.parse(optionsDataRaw);

  const payload = {
    requestId: optionsData.requestId,
    optionId: selectedOption.optionId,
    customerName: document.getElementById("customerName").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    preferredDate: document.getElementById("preferredDate").value,
    preferredTime: document.getElementById("preferredTime").value,
    notes: document.getElementById("notes").value
  };

  try {
    const response = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("bookingMessage").innerText =
        "Booking submitted successfully.";
    } else {
      document.getElementById("bookingMessage").innerText =
        data.message || data.error || "Booking failed.";
    }
  } catch (error) {
    document.getElementById("bookingMessage").innerText =
      "Failed to connect to backend.";
    console.error(error);
  }
}

window.onload = setLang;
