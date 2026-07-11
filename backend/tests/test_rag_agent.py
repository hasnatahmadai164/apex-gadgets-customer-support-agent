from app.agents.rag_agent import MAX_REWRITES, route_after_grade


def test_relevant_result_goes_to_generate():
    state = {"is_relevant": True, "rewrite_count": 0}
    assert route_after_grade(state) == "generate"


def test_irrelevant_result_triggers_rewrite_when_retries_remain():
    state = {"is_relevant": False, "rewrite_count": 0}
    assert route_after_grade(state) == "rewrite"


def test_irrelevant_result_falls_back_to_generate_after_max_rewrites():
    state = {"is_relevant": False, "rewrite_count": MAX_REWRITES}
    assert route_after_grade(state) == "generate"
