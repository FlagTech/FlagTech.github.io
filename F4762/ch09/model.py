import time
import json
from IPython.display import HTML

def input_and_run(input, thread_id, assistant_id, **args):
    message = client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=input,
        **args
    )
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id,
    )

    return message, run

def wait_on_run(run, thread):
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread,
            run_id=run.id,
        )
        time.sleep(0.5)
    return run

def get_response(thread_id, **args):
    return client.beta.threads.messages.list(
        thread_id=thread_id, order="asc", **args)

def update_tools(ass_id, functions_table):
    tools = []
    for function in functions_table:
        tools.append(
            {"type": "function", "function": function['spec']}
        )
    client.beta.assistants.update(
        assistant_id=ass_id,
        tools=tools
    )
def call_tools(tool_calls, functions_table):
    outputs = []
    for tool in tool_calls:
        func_name = tool.function.name
        arguments = json.loads(tool.function.arguments)
        print(f'{func_name}({arguments})')
        for function in functions_table:
            if function['spec']['name'] == func_name:
                func = function['function']
                outputs.append({
                    'tool_call_id': tool.id,
                    'output': func(**arguments)
                })
                break
    return outputs

def show_html(messages):
    # 找出有文件內容的對話物件
    index = len(messages.data) - 1
    # 找到文件位置
    file_index = messages.data[index].content[0].text.annotations

    if len(file_index) != 0:
        file_ids = file_index[0].file_path.file_id
        content = client.files.content(file_ids)
        # 儲存 HTML
        content.stream_to_file('test.html')
        # 顯示 HTML
        html_content = content.content.decode('utf-8')
        display(HTML(html_content))
