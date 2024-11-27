const socket = io("https://www.exiva.com.br", {
    path: "/socket.io/",
    transports: ["websocket"],
    query: {
        token: "null",
        info: JSON.stringify({
            ip: "18.222.137.132",
            hostname: "ec2-18-229-137-138.sa-east-1.compute.amazonaws.com",
            city: "São Paulo",
            region: "São Paulo",
            country: "BR",
            loc: "-23.5475,-46.6361",
            org: "AS16509 Amazon.com, Inc.",
            postal: "01000-000",
            timezone: "America/Sao_Paulo",
        }),
    },
});

const statusElement = document.getElementById("status");
const guildsContainer = document.getElementById("guilds");
const guildCheckboxContainer = document.getElementById("guildCheckboxContainer");

let allGuildData = {}; // Stores all received guild data
let selectedGuilds = new Set(); // Tracks selected guilds

// Update checkboxes for guild selection
function updateGuildCheckboxes() {
    guildCheckboxContainer.innerHTML = ""; // Clear existing checkboxes

    Object.keys(allGuildData).forEach((guildName) => {
        // Create a checkbox for each guild
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = guildName;
        checkbox.value = guildName;

        // Check if the guild is already selected
        if (selectedGuilds.has(guildName)) {
            checkbox.checked = true;
        }

        // Add an event listener to update selected guilds
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                selectedGuilds.add(guildName);
            } else {
                selectedGuilds.delete(guildName);
            }

            renderGuilds(); // Update the display of guilds
        });

        // Create a label for the checkbox
        const label = document.createElement("label");
        label.htmlFor = guildName;
        label.textContent = guildName;

        // Wrap checkbox and label
        const wrapper = document.createElement("div");
        wrapper.classList.add("checkbox-wrapper");
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        guildCheckboxContainer.appendChild(wrapper);
    });
}

// Render guilds based on selection
function renderGuilds() {
    guildsContainer.innerHTML = ""; // Clear current display

    selectedGuilds.forEach((guildName) => {
        const players = allGuildData[guildName];

        // Create a section for the guild
        const guildSection = document.createElement("div");
        guildSection.classList.add("guild");

        // Add the guild title
        const guildTitle = document.createElement("h2");
        guildTitle.textContent = `Guild: ${guildName} (${players.length} Players)`;
        guildSection.appendChild(guildTitle);

        // Create a table for players
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Vocation</th>
                </tr>
            </thead>
            <tbody>
                ${players
                    .map(
                        (player) => `
                    <tr>
                        <td>${player.name}</td>
                        <td>${player.level}</td>
                        <td>${player.vocation}</td>
                    </tr>
                `
                    )
                    .join("")}
            </tbody>
        `;
        guildSection.appendChild(table);

        guildsContainer.appendChild(guildSection);
    });
}

// Handle connection events
socket.on("connect", () => {
    console.log("Connected to WebSocket!");
    statusElement.textContent = "Connected!";
    statusElement.style.color = "green";
});

socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket!");
    statusElement.textContent = "Disconnected!";
    statusElement.style.color = "red";
});

// Handle guild updates from the WebSocket
socket.onAny((eventName, players) => {
    if (eventName.startsWith("members:")) {
        const guildName = eventName.split(":")[1];
        console.log(`Update received for guild: ${guildName}`, players);

        // Update the global guild data
        allGuildData[guildName] = players;

        // Update checkboxes and render guilds
        updateGuildCheckboxes();
        renderGuilds();
    }
});

socket.on("error", (err) => {
    console.error("Socket Error:", err);
});
