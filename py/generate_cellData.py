import pandas as pd
import numpy as np
import random
from sklearn.neighbors import NearestNeighbors
import json
import logging
import sys


def setup_custom_logger(name):
    formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                                  datefmt='%Y-%m-%d %H:%M:%S')
    handler = logging.FileHandler('log.txt', mode='w')
    handler.setFormatter(formatter)
    screen_handler = logging.StreamHandler(stream=sys.stdout)
    screen_handler.setFormatter(formatter)
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(handler)
    logger.addHandler(screen_handler)
    return logger


TARGET_CELL = 61515


def parse_data():
    spots = pd.read_csv(r"E:\OMNI-SCI-FV\MsBrain_Eg1_VS6_JH_V6_05-02-2021\region_0\detected_transcripts.csv")
    x_mean = spots.global_x.mean()
    y_mean = spots.global_y.mean()
    z_mean = spots.global_z.mean()

    spots.global_x = spots.global_x - x_mean
    spots.global_y = spots.global_y - y_mean
    spots.global_z = spots.global_z - z_mean

    cell_metadata = pd.read_csv(r"E:\OMNI-SCI-FV\MsBrain_Eg1_VS6_JH_V6_05-02-2021\region_0\cell_metadata.csv")
    cell_metadata['center_z'] = 0

    centroids = cell_metadata[['center_x', 'center_y', 'center_z']].copy()
    centroids.center_x = centroids.center_x - x_mean
    centroids.center_y = centroids.center_y - y_mean

    top_row = pd.Series({'center_x': np.finfo(np.float32).min,
                         'center_y': np.finfo(np.float32).min,
                         'center_z': np.finfo(np.float32).min
                         })

    # top row will correspond to cell label=0, ie background
    centroids = pd.concat([top_row.to_frame().T, centroids], ignore_index=True)
    centroids['label'] = np.arange(centroids.shape[0])
    return spots, centroids


def run():
    nK = 15
    spots, centroids = parse_data()

    # cells_xyz = centroids[['center_x', 'center_y', 'center_z']].values
    # spots_xyz = spots[['global_x', 'global_y', 'global_z']].values
    # nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree').fit(cells_xyz)
    # dist, cell_labels = nbrs.kneighbors(spots_xyz)

    cell_labels = np.load('./notebook/cell_labels.npy')
    dist = np.load('./notebook/dist.npy')

    for label in centroids.label:
        if label > 113170:
            mask = (cell_labels == label) & (dist < 10)
            df = spots.iloc[mask].copy()
            df_out = df[['gene', 'global_x', 'global_y', 'global_z']]
            df_out.columns = ['gene', 'x', 'y', 'z']
            df_out.to_json('cellData/%d.json' % label, orient='records')
            logger.info('saved at cellData/%d.json' % label)


if __name__ == "__main__":
    logger = setup_custom_logger('myapp')
    run()
    logger.info('Done!')