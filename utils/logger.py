import logging
import os

def get_scraper_logger(name="scraper"):
    logger = logging.getLogger(name)
    
    # Solo añadir handlers si no existen para evitar logs duplicados
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)

        # Controlador de consola
        c_handler = logging.StreamHandler()
        c_handler.setLevel(logging.INFO)
        c_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))

        # Ruta absoluta para asegurar que el log se guarde en scrapper/
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        log_path = os.path.join(base_dir, "critical_errors.log")

        # Controlador de archivo para errores
        f_handler = logging.FileHandler(log_path, encoding='utf-8')
        f_handler.setLevel(logging.WARNING)
        f_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

        logger.addHandler(c_handler)
        logger.addHandler(f_handler)

    return logger