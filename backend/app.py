# from flask import Flask, request, jsonify
# import pytesseract
# from PIL import Image
# import os
# from tempfile import NamedTemporaryFile
# import re

# app = Flask(__name__)

# # -------- Function to extract amount --------
# def extract_amount(text):
#     # Searches for patterns like ₹ 120 or ₹1,200
#     match = re.search(r'₹\s*([\d,]+)', text)
#     if match:
#         return match.group(1).replace(',', '')
#     return "Not found"

# # -------- Function to categorize receipt text --------
# def categorize_text(text):
#     text = text.lower()
#     if 'food' in text or 'restaurant' in text or 'zomato' in text:
#         return "Food"
#     elif 'travel' in text or 'ola' in text or 'uber' in text:
#         return "Travel"
#     elif 'bill' in text or 'electricity' in text or 'recharge' in text:
#         return "Bills"
#     elif 'medicine' in text or 'pharmacy' in text:
#         return "Health"
#     else:
#         return "Others"

# # -------- Route to upload receipt image --------
# @app.route('/upload', methods=['POST'])
# def upload_receipt():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file provided'})
    
#     file = request.files['file']
#     temp = NamedTemporaryFile(delete=False)
#     file.save(temp.name)

#     # Extract text using OCR
#     text = pytesseract.image_to_string(Image.open(temp.name))
#     os.unlink(temp.name)  # Delete temp file after reading

#     # Analyze text
#     amount = extract_amount(text)
#     category = categorize_text(text)

#     return jsonify({
#         'amount': amount,
#         'category': category,
#         'text': text
#     })

# # -------- Run Flask server --------
# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Important for frontend communication
import pytesseract
from PIL import Image
import os
from tempfile import NamedTemporaryFile
import re
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# -------- Enhanced amount extraction --------
def extract_amount(text):
    # Multiple patterns to catch different formats
    patterns = [
        r'₹\s*([\d,]+\.?\d*)',
        r'rs\.?\s*([\d,]+\.?\d*)',
        r'total\s*₹?\s*([\d,]+\.?\d*)',
        r'amount\s*₹?\s*([\d,]+\.?\d*)',
        r'grand\s+total\s*₹?\s*([\d,]+\.?\d*)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            amount_str = match.group(1).replace(',', '')
            try:
                return float(amount_str)
            except ValueError:
                continue
    
    return 0.0  # Return 0 instead of "Not found" for easier processing

# -------- Enhanced categorization --------
def categorize_text(text):
    text = text.lower()
    
    categories = {
        "Food": ['food', 'restaurant', 'zomato', 'swiggy', 'cafe', 'pizza', 'burger', 'starbucks'],
        "Travel": ['travel', 'ola', 'uber', 'rapido', 'petrol', 'fuel', 'metro', 'bus'],
        "Bills": ['bill', 'electricity', 'recharge', 'water', 'internet', 'broadband'],
        "Health": ['medicine', 'pharmacy', 'medical', 'hospital', 'clinic'],
        "Shopping": ['amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'store'],
        "Entertainment": ['movie', 'netflix', 'prime', 'cinema', 'theater']
    }
    
    for category, keywords in categories.items():
        if any(keyword in text for keyword in keywords):
            return category
    
    return "Others"

# -------- Store transactions in memory --------
transactions = []

# -------- Route to upload receipt image --------
@app.route('/upload', methods=['POST'])
def upload_receipt():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'})
    
    try:
        temp = NamedTemporaryFile(delete=False)
        file.save(temp.name)

        # Extract text using OCR
        text = pytesseract.image_to_string(Image.open(temp.name))
        os.unlink(temp.name)  # Delete temp file after reading

        # Analyze text
        amount = extract_amount(text)
        category = categorize_text(text)
        
        # Create transaction record
        transaction = {
            'id': len(transactions) + 1,
            'amount': amount,
            'category': category,
            'date': datetime.now().isoformat(),
            'type': 'receipt',
            'merchant': 'Receipt Purchase',
            'text_preview': text[:100] + '...' if len(text) > 100 else text
        }
        
        transactions.append(transaction)

        return jsonify({
            'success': True,
            'amount': amount,
            'category': category,
            'text_preview': text[:200],  # First 200 chars
            'transaction': transaction,
            'message': 'Receipt processed successfully!'
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': f'Processing failed: {str(e)}'})

# -------- New: SMS processing endpoint --------
@app.route('/process-sms', methods=['POST'])
def process_sms():
    try:
        data = request.json
        sms_text = data.get('sms_text', '')
        
        # Simple SMS parsing for UPI transactions
        patterns = [
            r'paid\s+rs?\.?\s*(\d+)\s+to\s+([^\.]+)',
            r'debited\s+rs?\.?\s*(\d+)\s+for\s+([^\.]+)',
            r'rs?\.?\s*(\d+)\s+spent\s+at\s+([^\.]+)'
        ]
        
        amount = 0
        merchant = "Unknown"
        
        for pattern in patterns:
            match = re.search(pattern, sms_text.lower())
            if match:
                amount = float(match.group(1))
                merchant = match.group(2).strip().title()
                break
        
        if amount > 0:
            category = categorize_text(merchant)
            
            transaction = {
                'id': len(transactions) + 1,
                'amount': amount,
                'category': category,
                'date': datetime.now().isoformat(),
                'type': 'sms',
                'merchant': merchant,
                'text_preview': sms_text[:100]
            }
            
            transactions.append(transaction)
            
            return jsonify({
                'success': True,
                'transaction': transaction,
                'message': 'SMS processed successfully!'
            })
        else:
            return jsonify({'success': False, 'error': 'Could not parse SMS'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# -------- New: Get all transactions --------
@app.route('/transactions', methods=['GET'])
def get_transactions():
    return jsonify({
        'success': True,
        'transactions': transactions,
        'count': len(transactions)
    })

# -------- New: Get insights --------
@app.route('/insights', methods=['GET'])
def get_insights():
    if not transactions:
        return jsonify({
            'success': True,
            'total_spent': 0,
            'category_breakdown': {},
            'message': 'No transactions yet'
        })
    
    total_spent = sum(t['amount'] for t in transactions)
    category_breakdown = {}
    
    for transaction in transactions:
        category = transaction['category']
        amount = transaction['amount']
        category_breakdown[category] = category_breakdown.get(category, 0) + amount
    
    return jsonify({
        'success': True,
        'total_spent': total_spent,
        'category_breakdown': category_breakdown,
        'transaction_count': len(transactions)
    })

# -------- Health check --------
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'SmartBudget AI API',
        'timestamp': datetime.now().isoformat()
    })

# -------- Run Flask server --------
if __name__ == '__main__':
    print("🚀 SmartBudget AI API Starting...")
    print("📁 Endpoints:")
    print("   POST /upload         - Process receipt image")
    print("   POST /process-sms    - Process SMS transaction")
    print("   GET  /transactions   - Get all transactions")
    print("   GET  /insights       - Get spending insights")
    print("   GET  /health         - Health check")
    print("\n🔗 API URL: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)