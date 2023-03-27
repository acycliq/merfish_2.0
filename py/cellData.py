import pandas as pd
import numpy as np
import random
import json
from sklearn.neighbors import NearestNeighbors



def app():
    nK = 15
    cell_gene_counts = np.load(r'cell_gene_counts.npy')
    # Reading from file
    cell_centroids = pd.read_json('cell_centroids.json')

    assert cell_gene_counts.shape[0] == cell_centroids.shape[0]
    out = []
    out_2 = []
    for idx, row in cell_centroids.iterrows():
        gid = np.where(cell_gene_counts[idx, :] > 0)[0].tolist()
        counts = cell_gene_counts[idx, cell_gene_counts[idx, :] > 0].tolist()
        spot_x = [d for d in gid]
        spot_y = [d for d in gid]
        spot_z = [d for d in gid]
        # spot_x = [d for i, d in enumerate(gid) for j in range(counts[i])]
        # spot_y= [d for i, d in enumerate(gid) for j in range(counts[i])]
        # spot_z = [d for i, d in enumerate(gid) for j in range(counts[i])]
        out.append({
            'label': idx + 1,
            'x:': row['x'],
            'y:': row['y'],
            'z:': row['z'],
            'gene_id': gid,
            'gene_counts': counts,
            'classes': random.sample(range(0, nK), 5) if any(cell_gene_counts[idx, :]) else [],
            'class_prob': np.random.dirichlet(np.ones(5), size=1)[0].tolist() if any(cell_gene_counts[idx, :]) else []
        })

        out_2.append({
            'spot_x': spot_x,
            'spot_y': spot_y,
            'spot_z': spot_z,
        })

    with open("cellData.json", "w") as final:
        json.dump(out, final)

    pd.DataFrame(out).to_csv('cellData.tsv', sep='\t', index=False)
    pd.DataFrame(out_2).to_csv('geneData.tsv', sep='\t', index=False)


if __name__ == '__main__':
    np.load(r'cell_gene_counts.npy')
    app()
    print('Done')
