import requests
import json
import time
import asyncio
from typing import Dict, Any, Optional

class SMS24HClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'https://api.sms24h.org/stubs/handler_api'

    def get_balance(self) -> float:
        try:
            response = requests.get(self.base_url, params={
                'api_key': self.api_key,
                'action': 'getBalance'
            })
            if response.text.startswith('ACCESS_BALANCE:'):
                return float(response.text.split(':')[1])
            return 0.0
        except Exception as e:
            print(f"[SMS24H] Error getting balance: {e}")
            return 0.0

    def get_number(self, service: str, country: int = 73, operator: str = 'any') -> Dict[str, Any]:
        try:
            response = requests.get(self.base_url, params={
                'api_key': self.api_key,
                'action': 'getNumber',
                'service': service,
                'country': country,
                'operator': operator,
                'forward': 0
            })

            text = response.text
            if text.startswith('ACCESS_NUMBER:'):
                # Format: ACCESS_NUMBER:ID:NUMBER
                parts = text.split(':')
                return {
                    'id': parts[1],
                    'numero': parts[2],
                    'servico': service,
                    'status': 'PENDING'
                }

            raise Exception(f"SMS24H Error: {text}")
        except Exception as e:
            print(f"[SMS24H] Error getting number: {e}")
            raise e

    def get_status(self, id: str) -> Dict[str, Any]:
        try:
            response = requests.get(self.base_url, params={
                'api_key': self.api_key,
                'action': 'getStatus',
                'id': id
            })

            text = response.text
            status_map = {
                'STATUS_WAIT_CODE': 'AGUARDANDO',
                'STATUS_WAIT_RETRY': 'AGUARDANDO_REENVIO',
                'STATUS_CANCEL': 'CANCELADO',
                'STATUS_OK': 'RECEBIDO'
            }

            if text.startswith('STATUS_OK:'):
                return {
                    'id': id,
                    'status': 'RECEBIDO',
                    'codigo': text.split(':')[1]
                }

            status = status_map.get(text, text)
            return {'id': id, 'status': status, 'codigo': None}
        except Exception as e:
            print(f"[SMS24H] Error getting status: {e}")
            return {'id': id, 'status': 'ERROR', 'error': str(e)}

    def set_status(self, id: str, status: int) -> str:
        # status: 8=Cancel, 6=Confirm, 3=Retry
        try:
            response = requests.get(self.base_url, params={
                'api_key': self.api_key,
                'action': 'setStatus',
                'id': id,
                'status': status
            })
            return response.text
        except Exception as e:
            print(f"[SMS24H] Error setting status: {e}")
            return "ERROR"

class MercadoPagoClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.mercadopago.com/v1"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Idempotency-Key": str(time.time())
        }

    def create_pix_payment(self, amount: float, description: str, payer_email: str = "cliente@ks-system.com") -> Dict[str, Any]:
        url = f"{self.base_url}/payments"
        payload = {
            "transaction_amount": float(amount),
            "description": description,
            "payment_method_id": "pix",
            "payer": {
                "email": payer_email,
                "first_name": "Cliente",
                "last_name": "KS"
            }
        }

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()

            poi = data.get("point_of_interaction", {}).get("transaction_data", {})
            return {
                "id": data.get("id"),
                "status": data.get("status"),
                "qr_code": poi.get("qr_code"),
                "qr_code_base64": poi.get("qr_code_base64"),
                "ticket_url": poi.get("ticket_url")
            }
        except Exception as e:
            print(f"[MercadoPago] Error creating payment: {e}")
            if hasattr(e, 'response') and e.response:
                print(e.response.text)
            raise e

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/payments/{payment_id}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return {
                "id": data.get("id"),
                "status": data.get("status"),
                "status_detail": data.get("status_detail"),
                "transaction_amount": data.get("transaction_amount")
            }
        except Exception as e:
            print(f"[MercadoPago] Error checking status: {e}")
            return {"status": "error"}
