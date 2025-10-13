// Temporary storage for location data when navigating between screens
let tempLocation: { latitude: string; longitude: string } | null = null;

export const setTempLocation = (latitude: string, longitude: string) => {
  tempLocation = { latitude, longitude };
};

export const getTempLocation = () => {
  return tempLocation;
};

export const clearTempLocation = () => {
  tempLocation = null;
};


