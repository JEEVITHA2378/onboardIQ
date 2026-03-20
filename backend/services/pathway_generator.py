"""
OnboardIQ+ — Pathway Generator Service
Builds a NetworkX DAG from the catalog and generates a topologically sorted
pathway for identified skill gaps.
"""
import networkx as nx
from models.schemas import PathwayModule
from services.rag_retriever import get_courses_for_skills
import json
import os

# In-memory graph of the catalog
catalog_graph = None
catalog_cache = None

def _load_catalog():
    global catalog_cache
    if catalog_cache is not None:
        return catalog_cache
        
    file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'course_catalog.json')
    try:
        with open(file_path, 'r') as f:
            catalog_cache = json.load(f)
        return catalog_cache
    except Exception as e:
        print(f"Error loading course catalog: {e}")
        return []

def get_course_by_id(course_id: str) -> PathwayModule | None:
    catalog = _load_catalog()
    for course_data in catalog:
        if course_data.get("id") == course_id:
            return PathwayModule(**course_data)
    return None

def _build_graph():
    """Builds a directed acyclic graph of course prerequisites."""
    global catalog_graph
    if catalog_graph is not None:
        return catalog_graph
        
    catalog = _load_catalog()
    catalog_graph = nx.DiGraph()
    
    # Add nodes
    for course in catalog:
        catalog_graph.add_node(course["id"], data=course)
        
    # Add edges
    for course in catalog:
        for prereq_id in course.get("prerequisites", []):
            if catalog_graph.has_node(prereq_id):
                catalog_graph.add_edge(prereq_id, course["id"])
                
    return catalog_graph


def generate_learning_pathway(skill_gaps: list[str]) -> list[PathwayModule]:
    """
    Takes a list of skill names where the user struggled.
    1. Finds courses teaching those skills.
    2. Travers ancestors in the DAG to find all prerequisites.
    3. Returns a deduplicated, topologically sorted list of modules.
    """
    graph = _build_graph()
    
    # RAG lookup to find target courses for the gaps
    target_courses = []
    for skill in skill_gaps:
        # Get courses
        related_courses = get_courses_for_skills([skill])
        for c in related_courses:
            # Map dict to PathwayModule
            target_courses.append(PathwayModule(
                id=c.get("id", ""),
                title=c.get("title", ""),
                duration_minutes=c.get("duration_minutes", 30),
                level=c.get("level", "intermediate"),
                skill_taught=skill
            ))
        
    if not target_courses:
        return []
        
    # Collect all needed nodes (targets + ancestors)
    needed_node_ids = set()
    for t_course in target_courses:
        node_id = t_course.id
        if graph.has_node(node_id):
            needed_node_ids.add(node_id)
            # Find all ancestors (prerequisites required to take this course)
            ancestors = nx.ancestors(graph, node_id)
            needed_node_ids.update(ancestors)
            
    # Create a subgraph of just what they need
    subgraph = graph.subgraph(needed_node_ids)
    
    try:
        # Topological sort ensures prerequisites come before the courses that need them
        sorted_node_ids = list(nx.topological_sort(subgraph))
    except nx.NetworkXUnfeasible:
        # Fallback if there's a cycle (shouldn't happen in a valid catalog)
        sorted_node_ids = list(needed_node_ids)
        
    # Build final pathway
    pathway = []
    order = 1
    for nid in sorted_node_ids:
        course_data = get_course_by_id(nid)
        if course_data:
            course_data.order = order
            pathway.append(course_data)
            order += 1
            
    return pathway

def get_subcomponent_graph(course_ids: list[str]):
    """Returns nodes and edges for rendering the DAG on the frontend."""
    graph = _build_graph()
    subgraph = graph.subgraph(course_ids)
    
    nodes = [{"id": n, "label": graph.nodes[n]["data"].get("title")} for n in subgraph.nodes()]
    edges = [{"source": u, "target": v} for u, v in subgraph.edges()]
    
    return {"nodes": nodes, "edges": edges}
