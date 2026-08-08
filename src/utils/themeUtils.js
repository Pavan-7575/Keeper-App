// Utility to compute high contrast card styles for Light and Dark modes

export const getNoteCardStyle = (color, darkMode) => {
    // If default white color or empty
    if (!color || color === '#ffffff') {
        return {
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
        };
    }

    if (darkMode) {
        // Sleek Dark Mode Tailored Palette
        const darkThemeColors = {
            '#fff3cd': '#332712', // Gold / Yellow
            '#d4edda': '#163320', // Emerald Green
            '#d1ecf1': '#132b3d', // Sapphire Blue
            '#f8d7da': '#3d1a24', // Ruby Pink
            '#e2d9f3': '#291b3b', // Amethyst Purple
        };
        return {
            backgroundColor: darkThemeColors[color] || '#1e2638',
            color: '#f8fafc',
        };
    } else {
        // Light Mode Pastel Palette
        return {
            backgroundColor: color,
            color: '#1e293b',
        };
    }
};
