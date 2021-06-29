---
jupytext:
  cell_metadata_filter: -all
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.10.3
kernelspec:
  display_name: SageMath 9.3
  language: sage
  name: sage-9.3
---

# Graph Edge Sampling  

I have written code that samples the edges of a given graph.  For example, when the complete graph $K_4$ is sampled we obtain the following subgraphs.

```{code-cell}
:tags: [hide-input]

def sample_graph_edges(G,k='default',labels_matter=False,draw=False,tabulate=true,vertex_labels_=False,edge_labels_=False,vertex_size_=10,figsize_=2):
    E=Set(G.edges())
    V=G.vertices()
    L=[]
    for s in E.subsets():
        if k=='default' or s.cardinality()==k:
            H=Graph()
            H.allow_multiple_edges(true)
            H.add_edges( s )
            edge_label_mset=[]
            for e in H.edges():
                H.delete_edge(e) # need to delete and add in order to
                if labels_matter:
                    label=e[2][0];
                    H.add_edge(e[0],e[1],label) # change labels of multiedges
                    if label:
                        edge_label_mset.append(label)
                else:
                    H.add_edge(e[0],e[1]) # None label
            Hcl=H.canonical_label()
            L.append((Hcl.copy(immutable=True),tuple(sorted(edge_label_mset))))
    Luniq=list(Set(L))
    if labels_matter: # then sort them before sorting by number of edges
        labels = [ tup[1] for tup in Luniq ]
        P = Permutation([labels.index(x)+1 for x in sorted(labels)])
        Luniq=P.action(Luniq)
    Lsorted=[]
    for size in range(G.size()+1):
        for i in range(len(Luniq)):
            if size==(Luniq[i][0]).size(): # 0th element is graph, 1st is set of edge labels
                Lsorted.append(Luniq[i])
    Csorted=[]
    Esorted=[]
    for H in Lsorted:
        c=L.count(H)
        e=H[0].size()
        Csorted.append(c)
        if labels_matter and H[1]:
            Esorted.append(H[1])
        else:
            Esorted.append(e)
        if draw:
                edge_labels_ = edge_labels_ or labels_matter
                H[0].show(figsize=figsize_,vertex_labels=vertex_labels_,vertex_size=vertex_size_,\
                          edge_labels=edge_labels_,title='Size=%s, Count=%s' %(e,c))
                #print(H[0].edges(),H[1])
    if tabulate:
        print('Isomorphism classes:\n')
        print(table(columns=[Esorted, Csorted]))
    return Esorted,Csorted
```

```{code-cell}
sample_graph_edges(graphs.CompleteGraph(4),draw=true);
```

```{code-cell}
:tags: [hide-input]

def add_multiedge(G,k=1,draw=false,vertex_labels_=false,edge_labels_=false,vertex_size_=10,figsize_=5):
    G.allow_multiple_edges(true)
    for e in G.edges():
        if not G.edge_label(e[0],e[1]):
            G.set_edge_label(e[0],e[1],0)
            for i in range(1,k+1):
                G.add_edge(e[0],e[1],i) # distinct labels
        else:
            orig_label=G.edge_label(e[0],e[1])
            G.set_edge_label(e[0],e[1],(orig_label[0],0)) # edge label is tuple
            for i in range(1,k+1):
                G.add_edge(e[0],e[1],(orig_label[0],i)) # distinct labels
    if draw:
        G.show(figsize=figsize_,vertex_labels=vertex_labels_,vertex_size=vertex_size_,edge_labels=edge_labels_)
    return G
```

```{code-cell}
:tags: [hide-input]

vertex_labels_=false
vertex_size_=10
figsize_=2
nmin=3
nmax=4
for n in range(nmin,nmax+1):
    Kn = graphs.CompleteGraph(n)
    e = binomial(n,2)
    Kn.show(figsize=figsize_,vertex_labels=vertex_labels_,vertex_size=vertex_size_,title='K%s has %s edges and %s subsets of edges' %(n,e,2^e))
    e_choose_k=[]
    for k in range(e+1):
        e_choose_k.append(binomial(e,k))
    print('Ways to choose:',table(e_choose_k),'\n')
    sample_graph_edges(graphs.CompleteGraph(n),draw=false)
```

```{code-cell}
:tags: [output_scroll]

G=graphs.CompleteGraph(3)
G=add_multiedge(G,2,draw=true)
sample_graph_edges(G,draw=true);
```

```{code-cell}
:tags: [output_scroll]

G=graphs.CompleteGraph(3)
G.set_edge_label(0,1,'a')
G.set_edge_label(1,2,'b')
G.set_edge_label(0,2,'c')
G.show(figsize=2,edge_labels=true)
G=add_multiedge(G,2,draw=true,figsize_=2)
print(table(G.edges()))
```

```{code-cell}
:tags: [output_scroll]

sample_graph_edges(G,3,labels_matter=true,draw=true);
```
