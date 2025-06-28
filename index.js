const API = "https://jsonplaceholder.typicode.com/users";
const form = document.getElementById("addContactForm");
const contactList = document.getElementById("contactList");
const searchInput = document.getElementById("search");
const groupFilter = document.getElementById("groupFilter");
const toggleThemeBtn = document.getElementById("toggle-theme");

document.addEventListener("DOMContentLoaded", loadContacts);
form.addEventListener("submit", handleAddContact);
searchInput.addEventListener("input", handleSearch);
groupFilter.addEventListener("change", handleFilter);
toggleThemeBtn.addEventListener("click", toggleTheme);
document.getElementById("feedbackForm").addEventListener("submit", handleFeedback);

function getLocalContacts() {
  return JSON.parse(localStorage.getItem('localContacts') || '[]');
}

function saveLocalContact(contact) {
  const locals = getLocalContacts();
  locals.push(contact);
  localStorage.setItem('localContacts', JSON.stringify(locals));
}

function updateLocalContact(id, updatedContact) {
  const locals = getLocalContacts();
  const index = locals.findIndex(c => c.id === id);
  if (index !== -1) {
    locals[index] = { ...locals[index], ...updatedContact };
    localStorage.setItem('localContacts', JSON.stringify(locals));
  }
}

function deleteLocalContact(id) {
  const locals = getLocalContacts().filter(c => c.id !== id);
  localStorage.setItem('localContacts', JSON.stringify(locals));
}

function loadContacts() {
  fetch(API)
    .then(res => res.json())
    .then(users => {
      const apiContacts = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: `${user.address.street}, ${user.address.city}`,
        group: "Other"
      }));
      const localContacts = getLocalContacts();
      displayContacts([...apiContacts, ...localContacts]);
    })
    .catch(() => {
      const localContacts = getLocalContacts();
      displayContacts(localContacts);
    });
}

// Add new contact
function handleAddContact(e) {
  e.preventDefault();
  const contact = {
    id: Date.now(),
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    address: form.address.value,
    group: form.group.value
  };

  saveLocalContact(contact);
  loadContacts();
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
  showDeleteConfirmation(id);
}

function showDeleteConfirmation(id) {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100%';
  popup.style.height = '100%';
  popup.style.backgroundColor = 'rgba(0,0,0,0.5)';
  popup.style.display = 'flex';
  popup.style.justifyContent = 'center';
  popup.style.alignItems = 'center';
  popup.style.zIndex = '1000';
  
  const dialog = document.createElement('div');
  dialog.style.background = '#fff';
  dialog.style.padding = '2rem';
  dialog.style.borderRadius = '12px';
  dialog.style.textAlign = 'center';
  dialog.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
  
  const message = document.createElement('p');
  message.textContent = 'Are you sure you want to delete this contact?';
  message.style.marginBottom = '1.5rem';
  message.style.fontSize = '1.1rem';
  
  const buttonDiv = document.createElement('div');
  buttonDiv.style.display = 'flex';
  buttonDiv.style.gap = '1rem';
  buttonDiv.style.justifyContent = 'center';
  
  const yesBtn = document.createElement('button');
  yesBtn.textContent = 'Yes';
  yesBtn.style.background = 'linear-gradient(45deg, #10309b, #93c6dd)';
  yesBtn.style.color = '#fff';
  yesBtn.style.border = 'none';
  yesBtn.style.padding = '0.7rem 1.5rem';
  yesBtn.style.borderRadius = '6px';
  yesBtn.style.cursor = 'pointer';
  yesBtn.onclick = () => {
    const locals = getLocalContacts();
    if (locals.find(c => c.id === id)) {
      deleteLocalContact(id);
    }
    loadContacts();
    document.body.removeChild(popup);
  };
  
  const noBtn = document.createElement('button');
  noBtn.textContent = 'No';
  noBtn.style.background = '#fff';
  noBtn.style.color = '#10309b';
  noBtn.style.border = '2px solid #10309b';
  noBtn.style.padding = '0.7rem 1.5rem';
  noBtn.style.borderRadius = '6px';
  noBtn.style.cursor = 'pointer';
  noBtn.onclick = () => document.body.removeChild(popup);
  
  buttonDiv.appendChild(yesBtn);
  buttonDiv.appendChild(noBtn);
  dialog.appendChild(message);
  dialog.appendChild(buttonDiv);
  popup.appendChild(dialog);
  document.body.appendChild(popup);
}

// Filter contacts by group
function handleFilter() {
  const selectedGroup = groupFilter.value;
  const searchQuery = searchInput.value.toLowerCase();
  
  fetch(API)
    .then(res => res.json())
    .then(users => {
      const apiContacts = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: `${user.address.street}, ${user.address.city}`,
        group: "Other"
      }));
      const localContacts = getLocalContacts();
      let allContacts = [...apiContacts, ...localContacts];
      
      // Filter by group
      if (selectedGroup !== "All") {
        allContacts = allContacts.filter(contact => contact.group === selectedGroup);
      }
      
      // Filter by search query
      if (searchQuery) {
        allContacts = allContacts.filter(contact =>
          contact.name.toLowerCase().includes(searchQuery)
        );
      }
      
      displayContacts(allContacts);
    });
}

// Handle feedback form submission
function handleFeedback(e) {
  e.preventDefault();
  const feedbackForm = document.getElementById("feedbackForm");
  alert("Thank you for your feedback!");
  feedbackForm.reset();
}

// Edit contact
function editContact(id) {
  const locals = getLocalContacts();
  const localContact = locals.find(c => c.id === id);
  
  if (localContact) {
    showEditForm(id, localContact);
  } else {
    fetch(`${API}/${id}`)
      .then(res => res.json())
      .then(user => {
        const contact = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: `${user.address.street}, ${user.address.city}`,
          group: "Other"
        };
        showEditForm(id, contact);
      });
  }
}

function showEditForm(id, contact) {
  const li = Array.from(contactList.children).find(li => {
    const buttons = li.querySelectorAll('button');
    return buttons.length === 2 && li.innerHTML.includes(contact.name);
  });
  if (!li) return;
  li.innerHTML = "";

      // Create a container for the edit form
      const formDiv = document.createElement("div");
      formDiv.style.display = "flex";
      formDiv.style.flexDirection = "column";
      formDiv.style.gap = "0.7rem";
      formDiv.style.padding = "1.5rem 1.2rem 1rem 1.2rem";
      formDiv.style.borderRadius = "16px";
      formDiv.style.boxShadow = "0 4px 16px rgba(16, 48, 155, 0.10)";
      
      const isDarkMode = document.body.classList.contains('dark-mode');
      if (isDarkMode) {
        formDiv.style.background = "linear-gradient(100deg, #333 70%, #444 100%)";
        formDiv.style.border = "2px solid #666";
        formDiv.style.color = "#fff";
      } else {
        formDiv.style.background = "linear-gradient(100deg, #e3f2fd 70%, #bbdefb 100%)";
        formDiv.style.border = "2px solid #93c6dd";
      }

      // Add edit title
      const editTitle = document.createElement("h3");
      editTitle.textContent = `Editing: ${contact.name}`;
      editTitle.style.margin = "0 0 1rem 0";
      editTitle.style.color = isDarkMode ? "#93c6dd" : "#10309b";
      formDiv.appendChild(editTitle);

      // Create input fields pre-filled with current values
      const nameDiv = document.createElement("div");
      nameDiv.style.display = "flex";
      nameDiv.style.alignItems = "center";
      nameDiv.style.gap = "1rem";
      
      const nameLabel = document.createElement("label");
      nameLabel.textContent = "Name:";
      nameLabel.style.fontWeight = "bold";
      nameLabel.style.color = isDarkMode ? "#ccc" : "#10309b";
      nameLabel.style.minWidth = "80px";
      
      const nameInput = document.createElement("input");
      nameInput.value = contact.name;
      nameInput.placeholder = "Full Name";
      nameInput.style.padding = "0.5rem";
      nameInput.style.borderRadius = "6px";
      if (isDarkMode) {
        nameInput.style.border = "2px solid #666";
        nameInput.style.background = "#555";
        nameInput.style.color = "#fff";
      } else {
        nameInput.style.border = "2px solid #93c6dd";
        nameInput.style.color = "#1565c0";
      }

      const emailDiv = document.createElement("div");
      emailDiv.style.display = "flex";
      emailDiv.style.alignItems = "center";
      emailDiv.style.gap = "1rem";
      
      const emailLabel = document.createElement("label");
      emailLabel.textContent = "Email:";
      emailLabel.style.fontWeight = "bold";
      emailLabel.style.color = isDarkMode ? "#ccc" : "#10309b";
      emailLabel.style.minWidth = "80px";
      
      const emailInput = document.createElement("input");
      emailInput.type = "email";
      emailInput.value = contact.email;
      emailInput.placeholder = "Email Address";
      emailInput.style.padding = "0.5rem";
      emailInput.style.borderRadius = "6px";
      if (isDarkMode) {
        emailInput.style.border = "2px solid #666";
        emailInput.style.background = "#555";
        emailInput.style.color = "#fff";
      } else {
        emailInput.style.border = "2px solid #93c6dd";
        emailInput.style.color = "#1565c0";
      }

      const phoneDiv = document.createElement("div");
      phoneDiv.style.display = "flex";
      phoneDiv.style.alignItems = "center";
      phoneDiv.style.gap = "1rem";
      
      const phoneLabel = document.createElement("label");
      phoneLabel.textContent = "Phone:";
      phoneLabel.style.fontWeight = "bold";
      phoneLabel.style.color = isDarkMode ? "#ccc" : "#10309b";
      phoneLabel.style.minWidth = "80px";
      
      const phoneInput = document.createElement("input");
      phoneInput.value = contact.phone;
      phoneInput.placeholder = "Phone Number";
      phoneInput.style.padding = "0.5rem";
      phoneInput.style.borderRadius = "6px";
      if (isDarkMode) {
        phoneInput.style.border = "2px solid #666";
        phoneInput.style.background = "#555";
        phoneInput.style.color = "#fff";
      } else {
        phoneInput.style.border = "2px solid #93c6dd";
        phoneInput.style.color = "#1565c0";
      }

      const addressDiv = document.createElement("div");
      addressDiv.style.display = "flex";
      addressDiv.style.alignItems = "center";
      addressDiv.style.gap = "1rem";
      
      const addressLabel = document.createElement("label");
      addressLabel.textContent = "Address:";
      addressLabel.style.fontWeight = "bold";
      addressLabel.style.color = isDarkMode ? "#ccc" : "#10309b";
      addressLabel.style.minWidth = "80px";
      
      const addressInput = document.createElement("input");
      addressInput.value = contact.address;
      addressInput.placeholder = "Physical Address";
      addressInput.style.padding = "0.5rem";
      addressInput.style.borderRadius = "6px";
      if (isDarkMode) {
        addressInput.style.border = "2px solid #666";
        addressInput.style.background = "#555";
        addressInput.style.color = "#fff";
      } else {
        addressInput.style.border = "2px solid #93c6dd";
        addressInput.style.color = "#1565c0";
      }

      const groupDiv = document.createElement("div");
      groupDiv.style.display = "flex";
      groupDiv.style.alignItems = "center";
      groupDiv.style.gap = "1rem";
      
      const groupLabel = document.createElement("label");
      groupLabel.textContent = "Group:";
      groupLabel.style.fontWeight = "bold";
      groupLabel.style.color = isDarkMode ? "#ccc" : "#10309b";
      groupLabel.style.minWidth = "80px";
      
      const groupSelect = document.createElement("select");
      groupSelect.style.padding = "0.5rem";
      groupSelect.style.borderRadius = "6px";
      if (isDarkMode) {
        groupSelect.style.border = "2px solid #666";
        groupSelect.style.background = "#555";
        groupSelect.style.color = "#fff";
      } else {
        groupSelect.style.border = "2px solid #93c6dd";
        groupSelect.style.color = "#1565c0";
      }
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
      saveBtn.style.background = "linear-gradient(45deg, #10309b, #93c6dd)";
      saveBtn.style.color = "#fff";
      saveBtn.style.border = "none";
      saveBtn.style.borderRadius = "6px";
      saveBtn.style.padding = "0.5rem 1.2rem";
      saveBtn.style.fontWeight = "bold";
      saveBtn.style.cursor = "pointer";
      saveBtn.style.boxShadow = "0 2px 8px rgba(16, 48, 155, 0.10)";

      saveBtn.addEventListener("click", () => {
        const updated = {
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          address: addressInput.value,
          group: groupSelect.value
        };
        
        const locals = getLocalContacts();
        if (locals.find(c => c.id === id)) {
          updateLocalContact(id, updated);
        }
        loadContacts();
      });

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.style.background = "#fff";
      cancelBtn.style.color = "#10309b";
      cancelBtn.style.border = "2px solid #10309b";
      cancelBtn.style.borderRadius = "6px";
      cancelBtn.style.padding = "0.5rem 1.2rem";
      cancelBtn.style.fontWeight = "bold";
      cancelBtn.style.cursor = "pointer";
      cancelBtn.addEventListener("click", loadContacts);

      // Append labels and inputs to their wrapper divs
      nameDiv.appendChild(nameLabel);
      nameDiv.appendChild(nameInput);
      emailDiv.appendChild(emailLabel);
      emailDiv.appendChild(emailInput);
      phoneDiv.appendChild(phoneLabel);
      phoneDiv.appendChild(phoneInput);
      addressDiv.appendChild(addressLabel);
      addressDiv.appendChild(addressInput);
      groupDiv.appendChild(groupLabel);
      groupDiv.appendChild(groupSelect);
      
      // Append wrapper divs to form
      formDiv.appendChild(nameDiv);
      formDiv.appendChild(emailDiv);
      formDiv.appendChild(phoneDiv);
      formDiv.appendChild(addressDiv);
      formDiv.appendChild(groupDiv);
      btnDiv.appendChild(saveBtn);
      btnDiv.appendChild(cancelBtn);
      formDiv.appendChild(btnDiv);

      li.appendChild(formDiv);
}

// Search contacts (event: input)
function handleSearch(e) {
  handleFilter();
}

// Toggle dark mode (event: click)
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}
