const API = "http://localhost:3000/contacts";
const form = document.getElementById("addContactForm");
const contactList = document.getElementById("contactList");
const searchInput = document.getElementById("search");
const toggleThemeBtn = document.getElementById("toggle-theme");

document.addEventListener("DOMContentLoaded", loadContacts);
form.addEventListener("submit", handleAddContact);
searchInput.addEventListener("input", handleSearch);
toggleThemeBtn.addEventListener("click", toggleTheme);

// Load contacts from json-server
function loadContacts() {
  fetch(API)
    .then(res => res.json())
    .then(data => displayContacts(data));
}

// Add new contact
function handleAddContact(e) {
  e.preventDefault();
  const contact = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    address: form.address.value,
    group: form.group.value
  };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact)
  })
    .then(res => res.json())
    .then(loadContacts);

  form.reset();
}

// Display contacts using array iteration
function displayContacts(contacts) {
  contactList.innerHTML = "";
  contacts.forEach(contact => {
    const li = document.createElement("li");
    li.className = "contact-item";
    li.innerHTML = `
      <strong>${contact.name}</strong> (${contact.group})<br/>
      📧 ${contact.email}<br/>
      📞 ${contact.phone}<br/>
      🏠 ${contact.address}<br/>
    `;

    // Create Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => editContact(contact.id));

    // Create Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteContact(contact.id));

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    contactList.appendChild(li);
  });
}

// Delete contact
function deleteContact(id) {
  fetch(`${API}/${id}`, {
    method: "DELETE"
  }).then(loadContacts);
}

// Edit contact
function editContact(id) {
  // Find the <li> for this contact
  const li = Array.from(contactList.children).find(li =>
    li.querySelector("button") && li.innerHTML.includes(`Edit`) && li.innerHTML.includes(`Delete`)
  );

  // Get the contact data from the API
  fetch(`${API}/${id}`)
    .then(res => res.json())
    .then(contact => {
      // Clear the li content
      li.innerHTML = "";

      // Create a container for the edit form
      const formDiv = document.createElement("div");
      formDiv.style.display = "flex";
      formDiv.style.flexDirection = "column";
      formDiv.style.gap = "0.7rem";
      formDiv.style.padding = "0.5rem 0";

      // Create input fields pre-filled with current values
      const nameInput = document.createElement("input");
      nameInput.value = contact.name;
      nameInput.placeholder = "Full Name";
      nameInput.style.padding = "0.5rem";
      nameInput.style.borderRadius = "6px";
      nameInput.style.border = "1.5px solid #ff9800";

      const emailInput = document.createElement("input");
      emailInput.type = "email";
      emailInput.value = contact.email;
      emailInput.placeholder = "Email Address";
      emailInput.style.padding = "0.5rem";
      emailInput.style.borderRadius = "6px";
      emailInput.style.border = "1.5px solid #ff9800";

      const phoneInput = document.createElement("input");
      phoneInput.value = contact.phone;
      phoneInput.placeholder = "Phone Number";
      phoneInput.style.padding = "0.5rem";
      phoneInput.style.borderRadius = "6px";
      phoneInput.style.border = "1.5px solid #ff9800";

      const addressInput = document.createElement("input");
      addressInput.value = contact.address;
      addressInput.placeholder = "Physical Address";
      addressInput.style.padding = "0.5rem";
      addressInput.style.borderRadius = "6px";
      addressInput.style.border = "1.5px solid #ff9800";

      const groupSelect = document.createElement("select");
      groupSelect.style.padding = "0.5rem";
      groupSelect.style.borderRadius = "6px";
      groupSelect.style.border = "1.5px solid #ff9800";
      ["Family", "Work", "Clients", "Other"].forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        if (contact.group === opt) option.selected = true;
        groupSelect.appendChild(option);
      });

      // Save and Cancel buttons
      const btnDiv = document.createElement("div");
      btnDiv.style.display = "flex";
      btnDiv.style.gap = "0.7rem";
      btnDiv.style.marginTop = "0.5rem";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.style.background = "#ff9800";
      saveBtn.style.color = "#fff";
      saveBtn.style.border = "none";
      saveBtn.style.borderRadius = "6px";
      saveBtn.style.padding = "0.5rem 1.2rem";
      saveBtn.style.fontWeight = "bold";
      saveBtn.style.cursor = "pointer";
      saveBtn.style.transition = "background 0.2s";
      saveBtn.addEventListener("mouseover", () => saveBtn.style.background = "#ff5722");
      saveBtn.addEventListener("mouseout", () => saveBtn.style.background = "#ff9800");

      saveBtn.addEventListener("click", () => {
        const updated = {
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          address: addressInput.value,
          group: groupSelect.value
        };
        fetch(`${API}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        }).then(loadContacts);
      });

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.style.background = "#fff";
      cancelBtn.style.color = "#ff9800";
      cancelBtn.style.border = "2px solid #ff9800";
      cancelBtn.style.borderRadius = "6px";
      cancelBtn.style.padding = "0.5rem 1.2rem";
      cancelBtn.style.fontWeight = "bold";
      cancelBtn.style.cursor = "pointer";
      cancelBtn.style.transition = "background 0.2s, color 0.2s";
      cancelBtn.addEventListener("mouseover", () => {
        cancelBtn.style.background = "#ff9800";
        cancelBtn.style.color = "#fff";
      });
      cancelBtn.addEventListener("mouseout", () => {
        cancelBtn.style.background = "#fff";
        cancelBtn.style.color = "#ff9800";
      });
      cancelBtn.addEventListener("click", loadContacts);

      // Append fields and buttons
      formDiv.appendChild(nameInput);
      formDiv.appendChild(emailInput);
      formDiv.appendChild(phoneInput);
      formDiv.appendChild(addressInput);
      formDiv.appendChild(groupSelect);
      btnDiv.appendChild(saveBtn);
      btnDiv.appendChild(cancelBtn);
      formDiv.appendChild(btnDiv);

      li.appendChild(formDiv);
    });
}

// Search contacts (event: input)
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  fetch(API)
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(contact =>
        contact.name.toLowerCase().includes(query)
      );
      displayContacts(filtered);
    });
}

// Toggle dark mode (event: click)
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  document.querySelectorAll(".contact-item").forEach(item => {
    item.classList.toggle("dark");
  });
}
