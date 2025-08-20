from openai import OpenAI
client = OpenAI()

response = client.responses.create(
  prompt={
    "id": "pmpt_6852c4a5810881959ac663b745dbcb74043673b546a18205",
    "version": "15",
    "variables": {
      "user_prompt": "What are the symptoms of diabetes?"
    }
  }
)

# Print the response structure
print("Response type:", type(response))
print("\nResponse content:")
print(response)