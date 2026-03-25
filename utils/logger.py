import logging

def get_scraper_logger(name="scraper"):
    logger = logging.getLogger(name)
    
    # Solo añadir handlers si no existen para evitar logs duplicados
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)

        # Controlador de consola
        c_handler = logging.StreamHandler()
        c_handler.setLevel(logging.INFO)
        c_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))

        # Controlador de archivo para errores
        f_handler = logging.FileHandler("critical_errors.log", encoding='utf-8')
        f_handler.setLevel(logging.WARNING)
        f_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

        logger.addHandler(c_handler)
        logger.addHandler(f_handler)

    return logger