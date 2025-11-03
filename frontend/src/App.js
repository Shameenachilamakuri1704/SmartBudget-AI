// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import './App.css';

// ChartJS.register(ArcElement, Tooltip, Legend);

// const API_BASE = 'http://localhost:5000';

// function App() {
//   const [transactions, setTransactions] = useState([]);
//   const [insights, setInsights] = useState(null);
//   const [smsText, setSmsText] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchTransactions();
//     fetchInsights();
//   }, []);

//   const fetchTransactions = async () => {
//     try {
//       const response = await axios.get('${API_BASE}/transactions');
//       setTransactions(response.data.transactions);
//     } catch (error) {
//       console.error('Error fetching transactions:', error);
//     }
//   };

//   const fetchInsights = async () => {
//     try {
//       const response = await axios.get('${API_BASE}/insights');
//       setInsights(response.data);
//     } catch (error) {
//       console.error('Error fetching insights:', error);
//     }
//   };

//   const processReceipt = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('file', file);

//     setLoading(true);
//     try {
//       const response = await axios.post('${API_BASE}/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       if (response.data.success) {
//         alert('Receipt processed successfully!');
//         fetchTransactions();
//         fetchInsights();
//       } else {
//         alert('Error: ' + response.data.error);
//       }
//     } catch (error) {
//       console.error('Error processing receipt:', error);
//       alert('Error processing receipt');
//     }
//     setLoading(false);
//   };

//   const processSMS = async () => {
//     if (!smsText.trim()) return;
    
//     setLoading(true);
//     try {
//       const response = await axios.post('${API_BASE}/process-sms', {
//         sms_text: smsText
//       });
      
//       if (response.data.success) {
//         setSmsText('');
//         alert('SMS processed successfully!');
//         fetchTransactions();
//         fetchInsights();
//       } else {
//         alert('Error: ' + response.data.error);
//       }
//     } catch (error) {
//       console.error('Error processing SMS:', error);
//       alert('Error processing SMS');
//     }
//     setLoading(false);
//   };

//   const categoryData = {
//     labels: insights && insights.category_breakdown ? Object.keys(insights.category_breakdown) : [],
//     datasets: [
//       {
//         data: insights && insights.category_breakdown ? Object.values(insights.category_breakdown) : [],
//         backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
//       }
//     ]
//   };

//   return (
//     <div className="App">
//       <header className="app-header">
//         <h1>SmartBudget AI</h1>
//         <p>AI-Powered Personal Finance Tracker</p>
//       </header>

//       <div className="container">
//         {/* Input Section */}
//         <div className="input-section">
//           <h2>Add Transaction</h2>
          
//           <div className="input-group">
//             <h3>📱 Via SMS/UPI Text</h3>
//             <textarea
//               value={smsText}
//               onChange={(e) => setSmsText(e.target.value)}
//               placeholder="Paste UPI SMS here. Example: 'Paid Rs.350 to Starbucks.'"
//               rows="3"
//             />
//             <button onClick={processSMS} disabled={loading}>
//               {loading ? 'Processing...' : 'Process SMS'}
//             </button>
//           </div>

//           <div className="input-group">
//             <h3>🧾 Via Receipt Image</h3>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={processReceipt}
//               disabled={loading}
//             />
//             <small>Upload a receipt image for OCR processing</small>
//           </div>
//         </div>

//         {/* Insights Section */}
//         {insights && insights.total_spent > 0 && (
//           <div className="insights-section">
//             <h2>💰 Financial Insights</h2>
//             <div className="insights-grid">
//               <div className="insight-card">
//                 <h3>Total Spent</h3>
//                 <p className="amount">₹{insights.total_spent}</p>
//               </div>
//               <div className="insight-card">
//                 <h3>Transactions</h3>
//                 <p className="amount">{insights.transaction_count}</p>
//               </div>
//               <div className="chart-container">
//                 <h3>Spending by Category</h3>
//                 <Doughnut data={categoryData} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Transactions Section */}
//         <div className="transactions-section">
//           <h2>📋 Recent Transactions</h2>
//           {transactions.length === 0 ? (
//             <p className="no-data">No transactions yet. Add some using the forms above!</p>
//           ) : (
//             <div className="transactions-list">
//               {transactions.map((transaction) => (
//                 <div key={transaction.id} className="transaction-item">
//                   <div className="transaction-info">
//                     <span className="merchant">{transaction.merchant}</span>
//                     <span className="category">{transaction.category}</span>
//                     <span className="date">{new Date(transaction.date).toLocaleDateString()}</span>
//                   </div>
//                   <div className="transaction-amount">
//                     ₹{transaction.amount}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// Base URL for API
const API_URL = 'http://localhost:5000';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [smsText, setSmsText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchInsights();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(API_URL + '/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await axios.get(API_URL + '/insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const processReceipt = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(API_URL + '/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        alert('Receipt processed successfully!');
        fetchTransactions();
        fetchInsights();
      } else {
        alert('Error: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Error processing receipt');
    }
    setLoading(false);
  };

  const processSMS = async () => {
    if (!smsText.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(API_URL + '/process-sms', {
        sms_text: smsText
      });
      
      if (response.data.success) {
        setSmsText('');
        alert('SMS processed successfully!');
        fetchTransactions();
        fetchInsights();
      } else {
        alert('Error: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error processing SMS:', error);
      alert('Error processing SMS');
    }
    setLoading(false);
  };

  const categoryData = {
    labels: insights && insights.category_breakdown ? Object.keys(insights.category_breakdown) : [],
    datasets: [
      {
        data: insights && insights.category_breakdown ? Object.values(insights.category_breakdown) : [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      }
    ]
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>SmartBudget AI</h1>
        <p>AI-Powered Personal Finance Tracker</p>
      </header>

      <div className="container">
        {/* Input Section */}
        <div className="input-section">
          <h2>Add Transaction</h2>
          
          <div className="input-group">
            <h3>📱 Via SMS/UPI Text</h3>
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste UPI SMS here. Example: 'Paid Rs.350 to Starbucks.'"
              rows="3"
            />
            <button onClick={processSMS} disabled={loading}>
              {loading ? 'Processing...' : 'Process SMS'}
            </button>
          </div>

          <div className="input-group">
            <h3>🧾 Via Receipt Image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={processReceipt}
              disabled={loading}
            />
            <small>Upload a receipt image for OCR processing</small>
          </div>
        </div>

        {/* Insights Section */}
        {insights && insights.total_spent > 0 && (
          <div className="insights-section">
            <h2>💰 Financial Insights</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <h3>Total Spent</h3>
                <p className="amount">₹{insights.total_spent}</p>
              </div>
              <div className="insight-card">
                <h3>Transactions</h3>
                <p className="amount">{insights.transaction_count}</p>
              </div>
              <div className="chart-container">
                <h3>Spending by Category</h3>
                <Doughnut data={categoryData} />
              </div>
            </div>
          </div>
        )}

        {/* Transactions Section */}
        <div className="transactions-section">
          <h2>📋 Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="no-data">No transactions yet. Add some using the forms above!</p>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="merchant">{transaction.merchant}</span>
                    <span className="category">{transaction.category}</span>
                    <span className="date">{new Date(transaction.date).toLocaleDateString()}</span>
                  </div>
                  <div className="transaction-amount">
                    ₹{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;