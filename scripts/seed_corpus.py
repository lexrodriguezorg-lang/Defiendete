#!/usr/bin/env python3
"""
Script de seed: carga inicial del corpus legal y prueba de RAG.

Uso:
    python scripts/seed_corpus.py --scrape       Scrape + indexar todo el catálogo
    python scripts/seed_corpus.py --test         Probar queries de RAG
    python scripts/seed_corpus.py --stats        Ver estadísticas del corpus
    python scripts/seed_corpus.py --demo         Demo completa: scrape + test
"""

import sys
import os
import json
import argparse

# Agregar backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import print as rprint

console = Console()


def scrape_and_index():
    """Scrape del catálogo completo y indexación en Qdrant."""
    from ingestion.pipeline import IngestionPipeline

    console.rule("[bold green]INGESTA DEL CORPUS LEGAL COLOMBIANO")

    pipeline = IngestionPipeline()
    pipeline.init()

    console.print("\n🔄 Scraping de leyes.senado.gov.co...\n")
    summary = pipeline.ingest_catalogo_completo()

    # Mostrar resumen
    table = Table(title="Resumen de Ingesta")
    table.add_column("Norma", style="cyan")
    table.add_column("Título", style="white")
    table.add_column("Chunks", justify="right", style="green")

    for norma in summary["normas"]:
        table.add_row(norma["norma"], norma["titulo"], str(norma["chunks"]))

    console.print(table)
    console.print(f"\n✅ Total: {summary['total_normas']} normas, {summary['total_chunks']} chunks indexados")
    console.print(f"📊 Estado Qdrant: {summary['stats']}")

    pipeline.close()
    return summary


def test_rag_queries():
    """Prueba queries de RAG contra el corpus."""
    from rag.retriever import LegalRetriever

    console.rule("[bold blue]TEST DE QUERIES RAG")

    retriever = LegalRetriever()

    # Queries de prueba por rama
    test_queries = [
        {
            "query": "¿Qué es la acción de tutela y cuándo se puede interponer?",
            "rama": "constitucional",
            "expected": "Art. 86 Constitución / Decreto 2591",
        },
        {
            "query": "Derecho de petición ante entidades del estado",
            "rama": "constitucional",
            "expected": "Art. 23 Constitución / Ley 1755",
        },
        {
            "query": "Violencia intrafamiliar pena y denuncia",
            "rama": "penal",
            "expected": "Art. 229 Código Penal",
        },
        {
            "query": "Custodia de hijos y regulación de alimentos",
            "rama": "familia",
            "expected": "Ley 1098 / Código Civil",
        },
        {
            "query": "Despido sin justa causa prestaciones liquidación",
            "rama": "laboral",
            "expected": "Código Sustantivo del Trabajo",
        },
        {
            "query": "Acoso laboral en el trabajo y queja",
            "rama": "laboral",
            "expected": "Ley 1010 de 2006",
        },
        {
            "query": "Protección de datos personales y habeas data",
            "rama": "constitucional",
            "expected": "Ley 1581 de 2012 / Art. 15 Constitución",
        },
        {
            "query": "Incidente de desacato por incumplimiento de tutela",
            "rama": "constitucional",
            "expected": "Art. 52 Decreto 2591",
        },
    ]

    results_summary = []

    for i, test in enumerate(test_queries, 1):
        console.print(f"\n[bold]Query {i}:[/bold] {test['query']}")
        console.print(f"[dim]Rama: {test['rama']} | Esperado: {test['expected']}[/dim]")

        results = retriever.search(
            query=test["query"],
            rama=test["rama"],
            top_k=5,
        )

        if results:
            console.print(f"[green]✅ {len(results)} resultados encontrados[/green]")
            for j, r in enumerate(results[:3], 1):
                meta = r["metadata"]
                score = r["score"]
                norma_info = f"{meta.get('tipo', '')} {meta.get('numero', '')} Art. {meta.get('articulo', '')}"
                console.print(
                    f"   {j}. [cyan]{norma_info}[/cyan] — Score: {score:.3f}"
                )
                console.print(f"      {r['text'][:150]}...")
            results_summary.append({"query": test["query"], "found": len(results), "top_score": results[0]["score"]})
        else:
            console.print("[red]❌ Sin resultados[/red]")
            results_summary.append({"query": test["query"], "found": 0, "top_score": 0})

    # Resumen final
    console.print("\n")
    table = Table(title="Resumen de Tests RAG")
    table.add_column("Query", style="white", max_width=50)
    table.add_column("Resultados", justify="right")
    table.add_column("Top Score", justify="right")
    table.add_column("Estado", justify="center")

    for r in results_summary:
        status = "✅" if r["found"] > 0 and r["top_score"] > 0.75 else "⚠️" if r["found"] > 0 else "❌"
        table.add_row(
            r["query"][:50],
            str(r["found"]),
            f"{r['top_score']:.3f}",
            status,
        )

    console.print(table)


def show_stats():
    """Muestra estadísticas del corpus en Qdrant."""
    from rag.qdrant_client import CorpusLegalDB

    console.rule("[bold yellow]ESTADÍSTICAS DEL CORPUS")

    db = CorpusLegalDB()
    try:
        stats = db.get_stats()
        console.print(Panel(json.dumps(stats, indent=2), title="Qdrant Stats"))
    except Exception as e:
        console.print(f"[red]Error conectando a Qdrant: {e}[/red]")
        console.print("[dim]¿Está corriendo docker-compose?[/dim]")


def demo_triage():
    """Demo del agente de triaje con un caso de ejemplo."""
    from agents.triage import TriageAgent

    console.rule("[bold magenta]DEMO: AGENTE DE TRIAJE")

    caso_ejemplo = """
    Buenas, necesito ayuda urgente. Mi ex pareja no me deja ver a mi hija de 5 años
    desde hace 3 meses. Tenemos custodia compartida por un acuerdo de conciliación
    del año pasado, pero él se la llevó a otra ciudad sin mi consentimiento.
    He intentado hablar con él pero me bloquea las llamadas. No tengo plata para
    un abogado. Vivo en Bogotá y él se fue para Medellín con la niña.
    ¿Qué puedo hacer? Me siento desesperada.
    """

    console.print("[bold]Caso de prueba:[/bold]")
    console.print(Panel(caso_ejemplo.strip()))

    agent = TriageAgent()
    console.print("\n🔄 Procesando con agente de triaje...\n")

    try:
        result = agent.diagnose(caso_ejemplo)
        formatted = agent.format_free_diagnosis(result)

        console.print(Panel(formatted, title="DIAGNÓSTICO GRATUITO", border_style="green"))
        console.print("\n[dim]Resultado JSON completo:[/dim]")
        console.print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        console.print("[dim]¿Está configurada la ANTHROPIC_API_KEY en .env?[/dim]")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="JusticIA — Seed & Test del Corpus Legal")
    parser.add_argument("--scrape", action="store_true", help="Scrape e indexar el catálogo completo")
    parser.add_argument("--test", action="store_true", help="Probar queries RAG")
    parser.add_argument("--stats", action="store_true", help="Estadísticas del corpus")
    parser.add_argument("--triage", action="store_true", help="Demo del agente de triaje")
    parser.add_argument("--demo", action="store_true", help="Demo completa")

    args = parser.parse_args()

    if args.demo:
        scrape_and_index()
        test_rag_queries()
        demo_triage()
    elif args.scrape:
        scrape_and_index()
    elif args.test:
        test_rag_queries()
    elif args.stats:
        show_stats()
    elif args.triage:
        demo_triage()
    else:
        parser.print_help()
