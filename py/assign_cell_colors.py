import pandas as pd
import numpy as np
import os
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


def get_top_gene(label, gene_colors):
    entry =  ".\cellData\%d.json" % label
    g = pd.read_json(entry)

    if g.shape[0] > 0:
        g = g.groupby('gene').size() \
            .sort_values(ascending=False)
        top_g = g.index[0]
        out = gene_colors[gene_colors.gene == top_g]
        return out[['r', 'g', 'b']]
    else:
        return pd.DataFrame({'r': 0, 'g': 0, 'b': 0}, index=[0])


def app():
    gene_colors = pd.read_csv(r"F:\potree\merfish_colour_scheme.csv")
    cellData = pd.read_csv(r"..\data\cellData.tsv", sep='\t')

    r = []
    g = []
    b = []
    class_prob = []
    for _, row in cellData.iterrows():
        # print(row.label)
        rgb = get_top_gene(row.label, gene_colors)
        cp = [round(p, 3) for p in eval(row.class_prob)]
        class_prob.append(cp)
        r.append(rgb.r.values[0])
        g.append(rgb.g.values[0])
        b.append(rgb.b.values[0])
    cellData = cellData.assign(r=r)
    cellData = cellData.assign(g=g)
    cellData = cellData.assign(b=b)
    cellData.class_prob = class_prob
    cellData = cellData.round({'x': 3, 'y': 3, 'z': 3})
    cellData = cellData[['label', 'x', 'y', 'z', 'classes', 'class_prob', 'r', 'g', 'b']]
    cellData.to_csv(r"..\data\cellData_rgb.tsv", index=False, sep='\t')
    # print(rgb)



if __name__ == "__main__":
    logger = setup_custom_logger('myapp')
    logger.info('Starting...')
    app()
    logger.info('Done')