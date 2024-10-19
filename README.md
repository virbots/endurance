# Endurance Profile Code Explanation

This codebase is for a web application that generates and visualizes swimming endurance profiles, for a swimming business that uses an Endless Pool. The application is built using TypeScript, JavaScript, HTML, and integrates Chart.js for data visualization with additional plugins for zooming and annotations.

## Key Components:

### 1. **TypeScript Classes:**
   - **`EnduranceEntry`**: Represents an endurance record for a swimmer. This includes properties like `id`, `name`, `stroke`, `date`, `pace`, `time`, and `note`. The `blob()` method serializes the entry into an object format.
   - **`AgeGroup`**: Represents a swimmer’s gender and age bracket, determining how the swimmer is classified. The `getTabName()` method converts gender ('M' or 'F') and ageBracket into a human-readable tab name (e.g., "Girls 10-12").
   - **`TimeStandard`**: Represents the performance standards for a specific age group, distance, stroke, and standard classification (e.g., B, BB, A). It includes methods to render a time standard as a table row (`toRow()`) and a status string (`toNiceStatus()`), which reflects progress towards achieving the time standard.
   - **`Swimmer`**: Represents a swimmer’s basic details such as name and age group. There are stubbed-out methods for returning gender and ageBracket.

### 2. **Chart.js Setup (in `index.js`):**
   The endurance profiles are plotted using Chart.js with scatter plot functionality. The chart includes zoom and pan features using the `chartjs-plugin-zoom` and annotations via `chartjs-plugin-annotation`.

   - **Zooming and Panning**: The zoom is configured to focus on the Y-axis (time) with options for smooth interaction via mouse wheel and pinch gestures.
   - **Reference Lines**: `refLines()` is used to add baseline performance curves (e.g., 100y, 50y, and 25y) to the chart as datasets.
   - **Data Management**: The data for the chart is dynamically updated based on the selected swimmer and stroke using the `updateChart()` function, which also manages annotations on the graph.

### 3. **HTML Structure:**
   The HTML (`template.html`) defines the layout, with the Chart.js canvas being the primary visual element. There are dropdowns for selecting swimmers and strokes, and a table for displaying standards relative to the swimmer’s performance.

### 4. **Interaction Flow:**
   - **Data Loading**: When the page loads, swimmer entries and time standards are fetched (from `readEnduranceEntries()` and `readSwimmers()`) and used to populate the swimmer selection dropdown.
   - **User Interaction**: When the user selects a swimmer and a stroke, the chart is updated by filtering endurance entries related to the swimmer and the selected stroke. The chart is then refreshed to show relevant data points.
   - **Standards Table**: The `get_standards()` function retrieves and displays the performance standards in a table based on the selected swimmer and stroke. The standards include required paces, times, and progress towards achieving them.

### 5. **Chart Customization:**
   - **Pace and Time Conversion**: The chart ticks and tooltips convert time values to a 'MM:SS' format using `window.toMinSec()`, ensuring that both X and Y axes represent times accurately.
   - **Annotations**: For each swimmer’s endurance data, annotations are placed on the chart to display pace information. These annotations update dynamically as the chart is zoomed or panned.

### 6. **Package Management (`package.json`)**:
   The project uses Webpack to bundle assets and dependencies. Key dependencies include:
   - `chart.js`: For rendering the endurance profiles as scatter plots.
   - `chartjs-plugin-annotation` and `chartjs-plugin-zoom`: To enhance the chart with annotation and zoom capabilities.
   - `jquery`: For DOM manipulation and event handling.
   - `ts-loader`: To transpile TypeScript code to JavaScript.

### 7. **Setup**:
   - Download webpack and http-server. Plus the packages in step 6 above.
   - To build: ./build.sh
   - To test:
       - ./run.sh
       - Open the link given by run.sh in a browser
   - To deploy to Google Sites:
       - Upload dist/main.<slug>.js to github.
       - On the website, replace the old main.<old_slug>.js with the new one on the Endurance Profiles page.
       - Test and publish.
