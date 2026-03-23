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

  if (document.getElementById("resultTitle")) {
    document.getElementById("resultTitle").innerText = c.result.title;
  }

  if (document.getElementById("currentTitle")) {
    document.getElementById("currentTitle").innerText = c.result.current;
  }

  if (document.getElementById("boundary")) {
    document.getElementById("boundary").innerText = c.result.boundary;
  }
}

function goUpload() {
  window.location.href = "upload.html";
}

function goResult() {
  const currentIssue = document.getElementById("problemInput")?.value || "";
  const desiredResult = document.getElementById("goalInput")?.value || "";

  const mockData = {
    requestId: "demo-001",
    options: [
      {
        optionId: "A",
        name: "Basic Repair",
        priceRange: "$150–300",
        description: "Simple repair with the lowest cost and fastest turnaround."
      },
      {
        optionId: "B",
        name: "Standard Upgrade",
        priceRange: "$400–700",
        description: "Balanced solution with better finish and stronger visual improvement."
      },
      {
        optionId: "C",
        name: "Premium Finish",
        priceRange: "$900+",
        description: "More complete upgrade with higher quality finish and stronger long-term value."
      }
    ],
    boundaryNote:
      "The system provides structured options. Final judgment and choice remain with the user."
  };

  localStorage.setItem("optionsData", JSON.stringify(mockData));
  localStorage.setItem(
    "userInputs",
    JSON.stringify({
      currentIssue,
      desiredResult
    })
  );

  window.location.href = "result.html";
}

function submitBooking() {
  const selectedOptionRaw = localStorage.getItem("selectedOption");
  const optionsDataRaw = localStorage.getItem("optionsData");

  if (!selectedOptionRaw || !optionsDataRaw) {
    const bookingMessage = document.getElementById("bookingMessage");
    if (bookingMessage) {
      bookingMessage.innerText = "Missing selected option or request data.";
    }
    return;
  }

  const selectedOption = JSON.parse(selectedOptionRaw);
  const optionsData = JSON.parse(optionsDataRaw);

  const payload = {
    requestId: optionsData.requestId,
    optionId: selectedOption.optionId,
    customerName: document.getElementById("customerName")?.value || "",
    phone: document.getElementById("phone")?.value || "",
    email: document.getElementById("email")?.value || "",
    address: document.getElementById("address")?.value || "",
    preferredDate: document.getElementById("preferredDate")?.value || "",
    preferredTime: document.getElementById("preferredTime")?.value || "",
    notes: document.getElementById("notes")?.value || ""
  };

  console.log("Booking payload:", payload);

  const bookingMessage = document.getElementById("bookingMessage");
  if (bookingMessage) {
    bookingMessage.innerText = "Booking saved locally for demo.";
  }
}

window.onload = setLang;
