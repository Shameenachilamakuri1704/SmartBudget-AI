from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Simple in-memory storage for demo
transactions = []
budgets = {}

@app.route('/')
def home():
    return jsonify({"message": "SmartBudget AI Backend is Working!"})

@app.route('/transactions', methods=['GET'])
def get_transactions():
    return jsonify(transactions)

@app.route('/transactions', methods=['POST'])
def add_transaction():
    data = request.json
    transaction = {
        'id': len(transactions) + 1,
        'amount': data.get('amount', 0),
        'category': data.get('category', 'Other'),
        'description': data.get('description', '')
    }
    transactions.append(transaction)
    return jsonify({"success": True, "transaction": transaction})

@app.route('/budget', methods=['POST'])
def set_budget():
    data = request.json
    category = data.get('category', 'General')
    amount = data.get('amount', 0)
    budgets[category] = amount
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)
