// CONSTANTS
const baseURL = "https://ifsp.ddns.net/webservices/imc";
const queryHeaders = {
  "Content-Type": "application/json",
};
const mutateHeaders = {
  "Content-Type": "application/x-www-form-urlencoded",
};

// Utils
function toUrlEncoded(data) {
  const params = new URLSearchParams();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      params.append(key, data[key]);
    }
  }
  return params.toString();
}

function showToast(
  text,
  duration = 1000,
  style = {
    background: "linear-gradient(to right, #555555, #222)",
  }
) {
  Toastify({
    text,
    duration,
    style,
  }).showToast();
}

const toaster = {
  info: (message) =>
    showToast(message, 1000, {
      background: "#000",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 10px #FFFFFF20",
    }),
  success: (message) =>
    showToast(message, 1000, {
      background: "#367675",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 10px #FFFFFF20",
    }),
  error: (message) =>
    showToast(message, 1000, {
      background: "#91342d",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 10px #FFFFFF20",
    }),
  warn: (message) =>
    showToast(message, 1000, {
      background: "#9f6824",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 10px #FFFFFF20",
    }),
};

async function wrapLoading(callback, message) {
  toaster.info(message);
  await new Promise((resolve) => setTimeout(resolve, 100));
  return await callback();
}

async function queryData(endpoint) {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: queryHeaders,
    });
    if (!response.ok) {
      throw new Error(response.text);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    toaster.error(
      "Erro ao conectar com o servidor! Verifique o console para mais detalhes."
    );
  }
}

async function mutateData(endpoint, data = {}, method = "POST") {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method,
      headers: mutateHeaders,
      body: data ? toUrlEncoded(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(response.text());
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    toaster.error(
      "Erro ao conectar com o servidor! Verifique o console para mais detalhes."
    );
  }
}

function findBiggestImc(persons = []) {
  let biggest = {
    index: 0,
    imc: persons[0].imc,
  };
  for (let i = 1; i < persons.length; i++) {
    if (parseFloat(persons[i].imc) > parseFloat(biggest.imc)) {
      biggest = {
        index: i,
        imc: persons[i].imc,
      };
    }
  }
  return persons[biggest.index];
}

function findLowestImc(persons = []) {
  let lowest = {
    index: 0,
    imc: persons[0].imc,
  };
  for (let i = 1; i < persons.length; i++) {
    if (parseFloat(persons[i].imc) < parseFloat(lowest.imc)) {
      lowest = {
        index: i,
        imc: persons[i].imc,
      };
    }
  }
  return persons[lowest.index];
}

const controller = {
  findOne: async (id) =>
    await wrapLoading(async () => {
      if (!id) {
        return null;
      }
      return await queryData(`/pessoa/${id}`);
    }, "Carregando pessoa..."),
  findAll: async () =>
    await wrapLoading(async () => {
      return await queryData("/pessoa");
    }, "Carregando pessoas..."),
  create: async (data) =>
    await wrapLoading(async () => {
      return await mutateData("/pessoa", data);
    }, "Criando pessoa..."),
  update: async (data) =>
    await wrapLoading(async () => {
      return await mutateData(`/pessoa/${data.id}`, data, "PUT");
    }, "Atualizando pessoa..."),
  remove: async (id) =>
    await wrapLoading(async () => {
      return await mutateData(`/pessoa/${id}`, {}, "DELETE");
    }, "Removendo..."),
};

// Render Functions
function createActionButton(text, classNames = []) {
  const button = document.createElement("button");
  button.innerText = text;
  classNames.map((name) => button.classList.add(name));
  return button;
}

function renderPerson(person) {
  const row = document.createElement("tr");
  Object.keys(person).map((key) => {
    const cell = document.createElement("td");
    cell.textContent = person[key];
    row.appendChild(cell);
  });
  return row;
}

function renderActionButtons(person = {}) {
  const cellOptions = document.createElement("td");
  cellOptions.classList.add("options");

  const removeButton = createActionButton("Remover", ["remove-btn"]);

  removeButton.addEventListener("click", async (_) => {
    const personId = parseInt(person.id);
    await controller.remove(personId);
    await renderTable();
  });

  const addWeightButton = createActionButton("+ Peso", [
    "add-weight-btn",
    "weight-btn",
  ]);

  addWeightButton.addEventListener("click", async (_) => {
    const newWeight = parseFloat(person.peso) + 0.5;
    const success = await controller.update({ ...person, peso: newWeight });
    if (success) {
      await renderTable();
    }
  });

  const removeWeightButton = createActionButton("- Peso", [
    "remove-weight-btn",
    "weight-btn",
  ]);

  removeWeightButton.addEventListener("click", async (_) => {
    const newWeight = parseFloat(person.peso) - 0.5;
    if (newWeight > 0) {
      console.log({ ...person, peso: newWeight });
      const success = await controller.update({ ...person, peso: newWeight });
      if (success) {
        await renderTable();
      }
    } else {
      toaster.error("O peso não deve ser menor que zero!");
    }
  });

  cellOptions.appendChild(removeButton);
  cellOptions.appendChild(addWeightButton);
  cellOptions.appendChild(removeWeightButton);
  return cellOptions;
}

async function renderTable() {
  const persons = await controller.findAll();
  const table = document.querySelector("#table tbody");
  table.replaceChildren();
  persons.map((person) => {
    const row = renderPerson(person);
    const buttonsCell = renderActionButtons(person);
    row.appendChild(buttonsCell);

    table.appendChild(row);
  });
}

// Event Listeners
document
  .querySelector("#remove-biggest")
  .addEventListener("click", async (_) => {
    const persons = await controller.findAll();
    if (!persons || persons.length === 0) {
      toaster.info("Sem pessoas cadastradas!");
      return;
    }
    const biggest = findBiggestImc(persons);
    if (biggest) {
      await controller.remove(biggest.id);
      await renderTable();
    }
  });

document
  .querySelector("#remove-lowest")
  .addEventListener("click", async (_) => {
    const persons = await controller.findAll();
    if (!persons || persons.length === 0) {
      toaster.info("Sem pessoas cadastradas!");
      return;
    }
    const lowest = findLowestImc(persons);
    if (lowest) {
      await controller.remove(lowest.id);
      await renderTable();
    }
  });

document.querySelector("#create").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = {
    nome: event.target[0].value,
    peso: parseFloat(event.target[1].value),
    altura: parseFloat(event.target[2].value),
  };
  if (data.peso <= 0 || data.altura <= 0) {
    alert("Peso e altura devem ser maiores que zero.");
    return;
  }
  const response = await controller.create(data);
  if (response) {
    await renderTable();
  }
  event.target.reset();
});

renderTable();
