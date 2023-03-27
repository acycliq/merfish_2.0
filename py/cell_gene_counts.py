## create an array nC-by-nG for the cell gene counts.
## it is a dummy array of the cell gene counts, to be used in the demo viewer

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
import json


def app():

    # Reading from file
    cell_centroids = pd.read_json('cell_centroids.json')


    df = pd.read_csv(r"E:\OMNI-SCI-FV\MsBrain_Eg1_VS6_JH_V6_05-02-2021\region_0\detected_transcripts.csv")
    # df = pd.read_csv(r"spots_min.csv").head(1000*1000)

    gene_panel, gene_id = np.unique(df.gene, return_inverse=True)

    # attach a gene_id colum to the dataframe
    df['gene_id'] = gene_id

    ## remove the mean from xyz coords. Actually I should be removing the width/2, height/2 and depth/2
    ## but this is a good enough approximation
    df.global_x = df.global_x - df.global_x.mean()
    df.global_y = df.global_y - df.global_y.mean()
    df.global_z = df.global_z - df.global_z.mean()

    top_row = pd.Series({'global_x': np.finfo(np.float32).min,
                         'global_y': np.finfo(np.float32).min,
                         'global_z': np.finfo(np.float32).min
                         })

    # top row will correspomd to cell label=0, ie background
    df = pd.concat([top_row.to_frame().T, df], ignore_index=True)

    xyz = df[['global_x', 'global_y', 'global_z']]

    nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree').fit(cell_centroids.values)
    dist, cell_labels = nbrs.kneighbors(xyz.values)
    mask = dist > 10
    cell_labels[mask] = 0  # assign spots further that 10 units from the centroid to the background


    cell_gene_counts = np.nan * np.zeros([cell_centroids.shape[0], len(gene_panel)]).astype(np.int32)
    _keys = np.arange(1, cell_centroids.shape[0] + 1)
    # _values = [[] for k in _keys]
    coord_x = dict(zip(_keys, [[] for k in _keys])).copy()
    coord_y = dict(zip(_keys, [[] for k in _keys])).copy()
    coord_z = dict(zip(_keys, [[] for k in _keys])).copy()
    gene_id_dict = dict(zip(_keys, [[] for k in _keys])).copy()
    # coord_x = dict.fromkeys(np.arange(1, cell_centroids.shape[0]+1).tolist(),  [])
    # coord_y = dict.fromkeys(np.arange(1, cell_centroids.shape[0] + 1).tolist(), [])
    # coord_z = dict.fromkeys(np.arange(1, cell_centroids.shape[0] + 1).tolist(), [])

    # gene_id_dict = dict.fromkeys(np.arange(1, cell_centroids.shape[0] + 1), [])

    for col_id, col in enumerate(cell_labels.T):
        print('doing col_id: %d' % col_id)
        for spot_id, spot_label in enumerate(col):
            if spot_label > 0:
                print('spot_id: %d with label: %d' % (spot_id, spot_label))
                gid = df.gene_id[spot_id]
                gid = int(gid)
                spot_label = int(spot_label)
                cell_gene_counts[spot_label, gid] = np.where(np.isnan(cell_gene_counts[spot_label, gid]), 0, cell_gene_counts[spot_label, gid]) + 1.0

                coord_x[spot_label].append(df.iloc[spot_id].global_x)
                coord_y[spot_label].append(df.iloc[spot_id].global_y)
                coord_z[spot_label].append(df.iloc[spot_id].global_z)
                gene_id_dict[spot_label].append(gid)

    np.save('cell_gene_counts.npy', cell_gene_counts)
    print('cell gene count array saved!')

    coord_x = {int(k):v for k,v in coord_x.items()}
    with open('coord_x.json', 'w') as fp:
        json.dump(coord_x, fp)

    coord_y = {int(k):v for k,v in coord_y.items()}
    with open('coord_y.json', 'w') as fp:
        json.dump(coord_y, fp)

    coord_z = {int(k):v for k,v in coord_z.items()}
    with open('coord_z.json', 'w') as fp:
        json.dump(coord_z, fp)

    gene_id_dict = {int(k):v for k,v in gene_id_dict.items()}
    with open('gene_id_dict.json', 'w') as fp:
        json.dump(gene_id_dict, fp)


    print(df.head())
    print('Done!')



if __name__ == '__main__':
    np.load(r'cell_gene_counts.npy')
    app()
    print('Done')
