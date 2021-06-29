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

# My First Markdown File 

I have **never** done this before, but I'm giving it the `college try`.

For example, here is a note:

```{note}
This is my first note. I should really buy Kristin some flowers. 
```

And here is a link to more [information](https://myst-parser.readthedocs.io/).

+++

## This is a subtitle

```{code-cell}
print("Here is some code to execute")
```

I am going to try something more complex here:

```{code-cell}
G = graphs.CompleteGraph(5)
G.show(figsize=3)
```

```{code-cell}
G = graphs.CompleteGraph(12)
G.show3d()
```

Here I am trying to refer to another page in my book, whose name is 
not {doc}`intro`, but rather {doc}`SymmetricFuctionExploration`


## Here I am including a figure 

![doodle](images/Doodle.png)

And another way

```{image} images/Doodle.png
:alt: the_doodle
:class: bg-primary mb-1
:width: 200px
:align: center
```

Example of toggling markdown content:

```{toggle}
Some hidden toggle content!

![](images/Doodle.png)
```

This is called an `admonition`:

```{admonition} Click the button to reveal!
:class: dropdown
Some hidden toggle content!

Did you think you were going to see a figure?  
```

## Including Videos?

```{code-cell}
:tags: [hide-input]

%%html
<iframe src="https://player.vimeo.com/video/26763844?title=0&byline=0&portrait=0" width="700" height="394" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe><p><a href="https://vimeo.com/26763844">BAXTER DURY - CLAIRE (Dir Cut)</a> from <a href="https://vimeo.com/dannysangra">Danny Sangra</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
```

```{code-cell}
:tags: [hide-input]

%%html
<iframe width="560" height="315" src="https://www.youtube.com/embed/S_f2qV2_U00?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
```

```{code-cell}
:tags: [hide-input]

%%html
<iframe src=https://apsc450computationalneuroscience.wordpress.com/mind-as-machine/ width=700 height=350></iframe>
```

```{note}
I am unable to include tikzmagic in code blocks within .md files.  At this point I can not get TikZ to work within a code-cell of an .md file, even though it works in .ipynb (see [](notebooks.ipynb) for working example).
```
