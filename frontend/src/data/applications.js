const applications = [
    {
      id: "bambu-printer",
      name: "Bambu Lab P1S",
      shortLabel: "3D",
      description: "Printer status, progress and model preview.",
      status: "Planned",
    },
    {
      id: "spotify",
      name: "Spotify",
      shortLabel: "SP",
      description: "Music playback and device controls.",
      status: "Planned",
    },
    {
      id: "weather",
      name: "Weather",
      shortLabel: "WE",
      description: "Current weather and local forecast.",
      status: "Planned",
    },
    {
      id: "home-assistant",
      name: "Home Assistant",
      shortLabel: "HA",
      description: "Smart-home devices, rooms and automations.",
      status: "Planned",
    },
    {
      id: "projects",
      name: "Projects",
      shortLabel: "PR",
      description: "Overview of personal software and hardware projects. Maybe add a GIT connection",
      status: "Planned",
    },
  ];
  
  
  export function getApplicationById(applicationId) {
    return applications.find(
      (application) => application.id === applicationId,
    );
  }
  
  
  export default applications;