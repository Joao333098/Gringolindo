"""
Gratian.pro API Manager
Gerenciador para controlar aplicações no Gratian.pro via API
"""

import requests
import os
import zipfile
from pathlib import Path
from typing import Optional, Dict, Any
import json

class GratianManager:
    """Gerenciador da API do Gratian.pro"""
    
    BASE_URL = "https://dashboard.gratian.pro/api/v2"
    
    def __init__(self, api_key: str):
        """
        Inicializa o gerenciador
        
        Args:
            api_key: Chave de API do Gratian.pro
        """
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}"
        }
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """
        Faz requisição para a API
        
        Args:
            method: Método HTTP (GET, POST, DELETE)
            endpoint: Endpoint da API
            **kwargs: Argumentos adicionais para requests
            
        Returns:
            Resposta da API em formato dict
        """
        url = f"{self.BASE_URL}{endpoint}"
        kwargs['headers'] = {**self.headers, **kwargs.get('headers', {})}
        
        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "status_code": getattr(e.response, 'status_code', None)
            }
    
    def create_app(self, 
                   zip_path: str,
                   name: str,
                   memory: int = 512,
                   disk: int = 1024,
                   ports: str = "3000",
                   primary: str = "3000",
                   image: str = "node:18",
                   cpu: int = 50,
                   variables: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Cria nova aplicação
        
        Args:
            zip_path: Caminho para arquivo ZIP com código
            name: Nome da aplicação
            memory: Memória em MB (padrão: 512)
            disk: Disco em MB (padrão: 1024)
            ports: Portas (padrão: "3000")
            primary: Porta primária (padrão: "3000")
            image: Imagem Docker (padrão: "node:18")
            cpu: CPU em % (padrão: 50)
            variables: Variáveis de ambiente
            
        Returns:
            Resposta da API
        """
        files = {'zip': open(zip_path, 'rb')}
        data = {
            'name': name,
            'memory': memory,
            'disk': disk,
            'ports': ports,
            'primary': primary,
            'image': image,
            'cpu': cpu
        }
        
        if variables:
            data['variables'] = json.dumps(variables)
        
        return self._make_request('POST', '/apps', files=files, data=data)
    
    def get_app_details(self, app_id: str) -> Dict[str, Any]:
        """
        Obtém detalhes da aplicação
        
        Args:
            app_id: ID da aplicação
            
        Returns:
            Detalhes da aplicação
        """
        return self._make_request('GET', f'/apps/{app_id}')
    
    def get_app_status(self, app_id: str) -> Dict[str, Any]:
        """
        Obtém status e métricas da aplicação
        
        Args:
            app_id: ID da aplicação
            
        Returns:
            Status e métricas
        """
        return self._make_request('GET', f'/apps/{app_id}/status')
    
    def get_app_logs(self, app_id: str) -> Dict[str, Any]:
        """
        Obtém logs da aplicação
        
        Args:
            app_id: ID da aplicação
            
        Returns:
            Logs da aplicação
        """
        return self._make_request('GET', f'/apps/{app_id}/logs')
    
    def deploy_app(self, app_id: str, zip_path: str) -> Dict[str, Any]:
        """
        Faz deploy/atualização de código
        
        Args:
            app_id: ID da aplicação
            zip_path: Caminho para novo arquivo ZIP
            
        Returns:
            Resposta do deploy
        """
        files = {'zip': open(zip_path, 'rb')}
        return self._make_request('POST', f'/apps/{app_id}/deploy', files=files)
    
    def start_app(self, app_id: str) -> Dict[str, Any]:
        """
        Inicia aplicação
        
        Args:
            app_id: ID da aplicação
            
        Returns:
            Resposta da ação
        """
        return self._make_request('POST', f'/apps/{app_id}/start')
    
    def stop_app(self, app_id: str) -> Dict[str, Any]:
        """
        Para aplicação
        
        Args:
            app_id: ID da aplicação
            
        Returns:
            Resposta da ação
        """
        return self._make_request('POST', f'/apps/{app_id}/stop')
    
    def restart_app(self, app_id: str) -> Dict[str, Any]:
        """
        Reinicia aplicação
        
        Args:
            app_id: ID da aplicação
            
        Returns:
            Resposta da ação
        """
        return self._make_request('POST', f'/apps/{app_id}/restart')
    
    def delete_app(self, app_id: str) -> Dict[str, Any]:
        """
        Deleta aplicação
        
        Args:
            app_id: ID da aplicação
            
        Returns:
            Resposta da deleção
        """
        return self._make_request('DELETE', f'/apps/{app_id}')
    
    def create_bot_zip(self, source_dir: str, output_path: str) -> str:
        """
        Cria arquivo ZIP do bot Discord
        
        Args:
            source_dir: Diretório com código do bot
            output_path: Caminho para salvar ZIP
            
        Returns:
            Caminho do arquivo ZIP criado
        """
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            source_path = Path(source_dir)
            
            # Arquivos essenciais do bot
            essential_files = [
                'index.js',
                'package.json',
                'config.json',
                'Handler',
                'Eventos',
                'ComandosSlash',
                'DataBaseJson'
            ]
            
            for item in essential_files:
                item_path = source_path / item
                if item_path.exists():
                    if item_path.is_file():
                        zipf.write(item_path, item_path.name)
                    elif item_path.is_dir():
                        for file in item_path.rglob('*'):
                            if file.is_file():
                                arcname = file.relative_to(source_path)
                                zipf.write(file, arcname)
        
        return output_path


# Funções auxiliares para uso no servidor FastAPI

def get_gratian_manager() -> Optional[GratianManager]:
    """
    Obtém instância do GratianManager com API key do config
    
    Returns:
        GratianManager ou None se API key não configurada
    """
    from server import read_json_file
    
    config = read_json_file("./DataBaseJson/config.json")
    api_key = config.get("gratian_api_key")
    
    if not api_key:
        return None
    
    return GratianManager(api_key)


def get_bot_app_id() -> Optional[str]:
    """
    Obtém ID da aplicação do bot no Gratian.pro
    
    Returns:
        App ID ou None se não configurado
    """
    from server import read_json_file
    
    config = read_json_file("./DataBaseJson/config.json")
    return config.get("gratian_bot_app_id")
