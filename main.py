import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# --- Конфигурация приложения ---
app = FastAPI(
    title="Chat API",
    description="API для взаимодействия с языковой моделью.",
    version="1.0.0"
)

# --- Монтирование статических файлов и шаблонов ---
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# --- Модели данных (Pydantic) для валидации запросов ---
class PromptRequest(BaseModel):
    """Модель запроса, содержащего промпт от пользователя."""
    prompt: str
    # Вы можете добавить сюда другие параметры, например, ID чата
    # chat_id: str | None = None

class GenerateResponse(BaseModel):
    """Модель ответа, содержащего сгенерированный текст."""
    response_text: str


# --- ЗАГЛУШКА ДЛЯ ВАШЕЙ МОДЕЛИ ---
# Замените этот блок логикой для загрузки и вызова вашей модели.
# Например, вы можете загрузить модель здесь один раз при старте сервера.
# from model_loader import my_model

async def get_model_response(prompt: str) -> str:
    """
    АСИНХРОННАЯ функция-заглушка для вызова вашей модели.
    Именно сюда вы должны интегрировать вашу обученную модель.

    Args:
        prompt: Текст от пользователя.

    Returns:
        Сгенерированный моделью ответ.
    """
    print(f"Получен промпт: {prompt}")
    # Имитируем задержку, как будто модель думает
    await asyncio.sleep(1.5)

    # ЗАМЕНИТЕ ЭТО НА ВЫЗОВ ВАШЕЙ МОДЕЛИ
    # response = my_model.generate(prompt)
    response = f"Это симулированный ответ на ваш вопрос: '{prompt}'. Интегрируйте свою модель здесь."

    print(f"Сгенерирован ответ: {response}")
    return response


# --- Маршруты API ---

@app.get("/", response_class=HTMLResponse)
async def get_chat_page(request: Request):
    """Отдает главную HTML-страницу с интерфейсом чата."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_text(prompt_request: PromptRequest):
    """
    Основная конечная точка API для генерации текста.
    Принимает промпт и возвращает ответ модели.
    """
    try:
        # Получаем ответ от модели
        response_text = await get_model_response(prompt_request.prompt)
        return GenerateResponse(response_text=response_text)
    except Exception as e:
        # Обработка возможных ошибок при генерации
        print(f"Ошибка при генерации: {e}")
        return GenerateResponse(response_text="Извините, произошла ошибка. Попробуйте еще раз.")

