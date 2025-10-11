#!/usr/bin/env python3

"""
AI Integration Example for ICT AI Knowledge System

This script demonstrates how to integrate the ICT AI Knowledge System
with various AI/LLM frameworks and services.
"""

import asyncio
import json
import requests
import websockets
from typing import Dict, List, Optional, Any
import time

class ICTKnowledgeIntegrator:
    """
    Integration client for ICT AI Knowledge System
    Provides methods for AI/LLM integration and training data preparation
    """
    
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.ws_connection = None
        
    def health_check(self) -> Dict[str, Any]:
        """Check system health and availability"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            raise
    
    def get_training_data(self, format_type: str = "openai", 
                         data_types: List[str] = None) -> Dict[str, Any]:
        """
        Get training data in various AI-friendly formats
        
        Args:
            format_type: 'openai', 'huggingface', 'anthropic', 'custom'
            data_types: ['concepts', 'qa', 'conversations', 'examples']
        """
        if data_types is None:
            data_types = ['concepts', 'qa', 'conversations']
            
        try:
            print(f"📦 Fetching training data in {format_type} format...")
            
            response = self.session.post(f"{self.base_url}/api/training-data/export", json={
                "format": format_type,
                "types": data_types,
                "include_metadata": True,
                "quality_filter": "high"
            })
            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Retrieved {data['summary']['total_examples']} training examples")
            return data
            
        except Exception as e:
            print(f"❌ Failed to get training data: {e}")
            raise
    
    def prepare_openai_training_data(self) -> List[Dict[str, Any]]:
        """Prepare training data specifically for OpenAI fine-tuning"""
        
        training_data = self.get_training_data("openai", ["qa", "conversations"])
        
        # Convert to OpenAI format
        openai_examples = []
        
        for example in training_data['data']['examples']:
            if example['type'] == 'qa':
                openai_examples.append({
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert ICT (Inner Circle Trader) trading educator. Provide accurate, detailed explanations of ICT concepts and trading strategies."
                        },
                        {
                            "role": "user", 
                            "content": example['question']
                        },
                        {
                            "role": "assistant",
                            "content": example['answer']
                        }
                    ]
                })
            elif example['type'] == 'conversation':
                messages = [
                    {
                        "role": "system",
                        "content": "You are an expert ICT trading educator. Help users understand institutional trading concepts."
                    }
                ]
                
                for turn in example['conversation']:
                    messages.append({
                        "role": turn['role'],
                        "content": turn['content']
                    })
                
                openai_examples.append({"messages": messages})
        
        print(f"📝 Prepared {len(openai_examples)} OpenAI training examples")
        return openai_examples
    
    def prepare_huggingface_dataset(self) -> Dict[str, List[str]]:
        """Prepare training data for HuggingFace transformers"""
        
        training_data = self.get_training_data("huggingface", ["concepts", "qa"])
        
        # Convert to HuggingFace format
        texts = []
        labels = []
        
        for example in training_data['data']['examples']:
            if example['type'] == 'concept':
                # Create instruction-following format
                instruction = f"Define and explain the ICT concept: {example['term']}"
                response = f"{example['definition']}\n\nKey points:\n" + \
                          "\n".join([f"- {point}" for point in example.get('key_points', [])])
                
                texts.append(f"### Instruction:\n{instruction}\n\n### Response:\n{response}")
                labels.append("concept_explanation")
                
            elif example['type'] == 'qa':
                texts.append(f"### Question:\n{example['question']}\n\n### Answer:\n{example['answer']}")
                labels.append("question_answer")
        
        print(f"📊 Prepared {len(texts)} HuggingFace examples")
        return {"text": texts, "label": labels}
    
    def get_embeddings_for_training(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for custom training or fine-tuning"""
        
        try:
            print(f"🧠 Generating embeddings for {len(texts)} texts...")
            
            response = self.session.post(f"{self.base_url}/api/embeddings/batch-generate", json={
                "texts": texts,
                "normalize": True,
                "include_metadata": False
            })
            response.raise_for_status()
            
            embeddings = response.json()['data']['embeddings']
            print(f"✅ Generated {len(embeddings)} embeddings")
            return embeddings
            
        except Exception as e:
            print(f"❌ Failed to generate embeddings: {e}")
            raise
    
    def validate_ai_understanding(self, model_responses: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Validate AI model understanding using the knowledge validation system
        
        Args:
            model_responses: List of {"question": str, "response": str, "expected": str}
        """
        
        try:
            print(f"🧪 Validating {len(model_responses)} AI responses...")
            
            response = self.session.post(f"{self.base_url}/api/validation/validate-responses", json={
                "responses": model_responses,
                "validation_criteria": {
                    "accuracy": True,
                    "completeness": True,
                    "clarity": True,
                    "ict_terminology": True
                }
            })
            response.raise_for_status()
            
            results = response.json()['data']
            
            print(f"📊 Validation Results:")
            print(f"  Overall Score: {results['overall_score']:.2%}")
            print(f"  Accuracy: {results['metrics']['accuracy']:.2%}")
            print(f"  Completeness: {results['metrics']['completeness']:.2%}")
            print(f"  ICT Terminology Usage: {results['metrics']['ict_terminology']:.2%}")
            
            return results
            
        except Exception as e:
            print(f"❌ Validation failed: {e}")
            raise
    
    def create_rag_knowledge_base(self) -> Dict[str, Any]:
        """Create a knowledge base for RAG (Retrieval-Augmented Generation)"""
        
        try:
            print("🏗️ Creating RAG knowledge base...")
            
            # Get all concepts and definitions
            concepts_response = self.session.get(f"{self.base_url}/api/knowledge-graph/export", params={
                "format": "rag",
                "include_relationships": True,
                "chunk_size": 512
            })
            concepts_response.raise_for_status()
            
            knowledge_base = concepts_response.json()['data']
            
            print(f"📚 Knowledge base created with {len(knowledge_base['chunks'])} chunks")
            print(f"📊 Covering {len(knowledge_base['concepts'])} ICT concepts")
            
            return knowledge_base
            
        except Exception as e:
            print(f"❌ Failed to create knowledge base: {e}")
            raise
    
    def semantic_search_for_rag(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Perform semantic search for RAG context retrieval"""
        
        try:
            response = self.session.post(f"{self.base_url}/api/embeddings/search", json={
                "query": query,
                "options": {
                    "limit": top_k,
                    "threshold": 0.7,
                    "include_metadata": True
                }
            })
            response.raise_for_status()
            
            results = response.json()['data']['results']
            
            # Format for RAG context
            rag_context = []
            for result in results:
                rag_context.append({
                    "content": result['content'],
                    "source": result.get('source', 'ICT Knowledge Base'),
                    "similarity": result['similarity'],
                    "metadata": result.get('metadata', {})
                })
            
            return rag_context
            
        except Exception as e:
            print(f"❌ Semantic search failed: {e}")
            raise
    
    async def real_time_learning_monitor(self, callback_func=None):
        """Monitor real-time learning progress via WebSocket"""
        
        try:
            ws_url = self.base_url.replace('http', 'ws')
            
            async with websockets.connect(ws_url) as websocket:
                print("🔌 Connected to real-time learning monitor")
                
                # Subscribe to learning events
                await websocket.send(json.dumps({
                    "event": "subscribe",
                    "data": {
                        "types": ["training-progress", "validation-results", "knowledge-updates"]
                    }
                }))
                
                async for message in websocket:
                    try:
                        data = json.loads(message)
                        
                        if callback_func:
                            await callback_func(data)
                        else:
                            print(f"📡 Learning Event: {data['event']}")
                            if 'progress' in data.get('data', {}):
                                print(f"  Progress: {data['data']['progress']:.1%}")
                            
                    except json.JSONDecodeError:
                        print(f"📡 Raw message: {message}")
                        
        except Exception as e:
            print(f"❌ WebSocket connection failed: {e}")
            raise

# Example AI Integration Functions

def integrate_with_openai():
    """Example: Integrate with OpenAI for fine-tuning"""
    
    integrator = ICTKnowledgeIntegrator()
    
    # Check system health
    integrator.health_check()
    
    # Prepare training data for OpenAI
    training_examples = integrator.prepare_openai_training_data()
    
    # Save to JSONL format for OpenAI fine-tuning
    with open('ict_training_data.jsonl', 'w') as f:
        for example in training_examples:
            f.write(json.dumps(example) + '\n')
    
    print("✅ OpenAI training data saved to ict_training_data.jsonl")
    print("💡 Use: openai api fine_tunes.create -t ict_training_data.jsonl -m gpt-3.5-turbo")

def integrate_with_huggingface():
    """Example: Integrate with HuggingFace transformers"""
    
    integrator = ICTKnowledgeIntegrator()
    
    # Prepare dataset
    dataset = integrator.prepare_huggingface_dataset()
    
    # Save as JSON for HuggingFace datasets
    with open('ict_hf_dataset.json', 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print("✅ HuggingFace dataset saved to ict_hf_dataset.json")
    print("💡 Load with: from datasets import Dataset; dataset = Dataset.from_json('ict_hf_dataset.json')")

def create_rag_system():
    """Example: Create a RAG system with ICT knowledge"""
    
    integrator = ICTKnowledgeIntegrator()
    
    # Create knowledge base
    knowledge_base = integrator.create_rag_knowledge_base()
    
    # Example RAG query
    query = "How do I identify institutional order blocks?"
    context = integrator.semantic_search_for_rag(query, top_k=3)
    
    print(f"\n🔍 RAG Query: {query}")
    print("📚 Retrieved Context:")
    for i, ctx in enumerate(context, 1):
        print(f"  {i}. ({ctx['similarity']:.2%}) {ctx['content'][:100]}...")
    
    # You would then use this context with your LLM
    rag_prompt = f"""
Context from ICT Knowledge Base:
{chr(10).join([f"- {ctx['content']}" for ctx in context])}

Question: {query}

Please provide a comprehensive answer based on the context above.
"""
    
    print(f"\n📝 RAG Prompt prepared ({len(rag_prompt)} characters)")

def validate_model_performance():
    """Example: Validate AI model performance"""
    
    integrator = ICTKnowledgeIntegrator()
    
    # Example model responses to validate
    test_responses = [
        {
            "question": "What is an order block?",
            "response": "An order block is a consolidation area where institutional orders are placed...",
            "expected": "Order blocks are areas of consolidation where large institutional orders create imbalances..."
        },
        {
            "question": "How do fair value gaps work?",
            "response": "Fair value gaps are areas where price moves quickly with little trading...",
            "expected": "Fair value gaps represent inefficiencies in price delivery where institutional algorithms..."
        }
    ]
    
    # Validate responses
    results = integrator.validate_ai_understanding(test_responses)
    
    print(f"\n📊 Model Performance Validation:")
    print(f"  Overall Score: {results['overall_score']:.2%}")
    
    for i, response_result in enumerate(results['individual_results']):
        print(f"  Response {i+1}: {response_result['score']:.2%}")

async def monitor_learning_progress():
    """Example: Monitor real-time learning progress"""
    
    integrator = ICTKnowledgeIntegrator()
    
    async def learning_callback(event_data):
        event_type = event_data.get('event')
        data = event_data.get('data', {})
        
        if event_type == 'training-progress':
            print(f"🏋️ Training Progress: {data.get('progress', 0):.1%}")
            print(f"   Current Epoch: {data.get('epoch', 0)}")
            print(f"   Loss: {data.get('loss', 0):.4f}")
            
        elif event_type == 'validation-results':
            print(f"✅ Validation Complete: {data.get('accuracy', 0):.2%} accuracy")
            
        elif event_type == 'knowledge-updates':
            print(f"📚 Knowledge Updated: {data.get('concepts_added', 0)} new concepts")
    
    # Monitor for 30 seconds
    print("🔍 Monitoring learning progress for 30 seconds...")
    
    try:
        await asyncio.wait_for(
            integrator.real_time_learning_monitor(learning_callback),
            timeout=30.0
        )
    except asyncio.TimeoutError:
        print("⏰ Monitoring session completed")

# Main execution examples
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        example = sys.argv[1]
        
        if example == "openai":
            integrate_with_openai()
        elif example == "huggingface":
            integrate_with_huggingface()
        elif example == "rag":
            create_rag_system()
        elif example == "validate":
            validate_model_performance()
        elif example == "monitor":
            asyncio.run(monitor_learning_progress())
        else:
            print("Available examples: openai, huggingface, rag, validate, monitor")
    else:
        print("🚀 Running all AI integration examples...\n")
        
        # Run all examples
        integrate_with_openai()
        print("\n" + "="*50 + "\n")
        
        integrate_with_huggingface()
        print("\n" + "="*50 + "\n")
        
        create_rag_system()
        print("\n" + "="*50 + "\n")
        
        validate_model_performance()
        print("\n" + "="*50 + "\n")
        
        print("🔍 To monitor real-time learning, run: python ai-integration.py monitor")