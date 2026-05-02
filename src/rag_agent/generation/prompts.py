from langchain_core.prompts import ChatPromptTemplate

ENTERPRISE_RAG_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        (
            "You are an enterprise data intelligence assistant. "
            "Answer questions using only the provided context.\n"
            "Be concise and precise, citing specific data points from the context.\n"
            "If the context does not contain enough information, say so clearly rather than guessing.\n\n"
            "Context:\n{context}"
        ),
    ),
    ("human", "{question}"),
])
