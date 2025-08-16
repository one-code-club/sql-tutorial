# SQL Tutorial (for CS in English)

A web-based, interactive SQL learning platform built with Next.js and powered by DuckDB. This application allows users to execute SQL queries against CSV files directly in the browser, offering both a traditional text editor and a visual query builder using Blockly.

## Features

- **In-Browser SQL Execution**: Leverages DuckDB WASM to run SQL queries entirely on the client-side. No server-side database setup is required.
- **Interactive SQL Editor**: A simple and intuitive SQL editor for writing and executing queries.
- **Visual Query Builder**: Build SQL queries visually using a drag-and-drop interface powered by Blockly.
- **CSV Data Loading**: Automatically loads sample CSV files from the `/data` directory to be used as database tables.
- **Result Grid**: View query results in a clear, sortable, and easy-to-read table format.
- **State Management**: Uses Zustand for efficient and lightweight global state management.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [DuckDB WASM](https://duckdb.org/docs/api/wasm.html)
- **UI**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Visual Editor**: [Blockly](https://developers.google.com/blockly)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or later)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/sql_tutorial.git
    cd sql_tutorial
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## How to Use

1.  **Select a Data Source**: The application automatically loads the sample CSV file (`sample1.csv`) from the `data/` directory on startup.
2.  **Explore the Schema**: The left pane displays the available tables (CSV files) and their respective columns.
3.  **Write a Query**: Use the SQL editor in the right pane to write your SQL query.
4.  **Use the Visual Builder**: Switch to the "Blockly" tab to build a query using the visual block interface.
5.  **Execute the Query**: Click the "Execute" button to run your query against the loaded data.
6.  **View Results**: The query results will appear in the grid at the bottom of the page.


