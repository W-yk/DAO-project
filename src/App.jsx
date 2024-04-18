import React from 'react';
import Main from './components/Main';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';  // Ensure you have an App.css file in your src directory

const App = () => {
    return (
        <div className="app-container">  {/* Apply a CSS class for styling */}            
            <Header />
            <Main />
            <Footer />
        </div>
    );
};

export default App;
