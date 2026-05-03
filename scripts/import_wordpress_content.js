const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const [pagesPath, postsPath] = process.argv.slice(2);

if (!pagesPath || !postsPath) {
  console.error("Usage: node scripts/import_wordpress_content.js <pages.json> <posts.json>");
  process.exit(1);
}

const root = process.cwd();
const pages = JSON.parse(fs.readFileSync(pagesPath, "utf8")).posts;
const posts = JSON.parse(fs.readFileSync(postsPath, "utf8")).posts;

function page(slug) {
  const match = pages.find((item) => item.slug === slug);
  if (!match) {
    throw new Error(`Missing WordPress page: ${slug}`);
  }
  return match;
}

function post(slug) {
  const match = posts.find((item) => item.slug === slug);
  if (!match) {
    throw new Error(`Missing WordPress post: ${slug}`);
  }
  return match;
}

function convert(html, format) {
  const result = spawnSync("pandoc", ["-f", "html", "-t", format, "--wrap=none"], {
    input: html || "",
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || `pandoc exited with ${result.status}`);
  }

  return tidy(result.stdout);
}

function tidy(content) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeWordPressButtonBlocks(content) {
  return content.replace(/\n?<div class="wp-block-buttons[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\n?/g, "\n");
}

const newPublications = String.raw`<span style="text-decoration:underline">Sakly S</span>, Conradi Smith GD. **Phase separation dynamics of SynGAP & PSD-95 in post-synaptic densities.** *In preparation.*

Kalajian EJ, Stettler MK, Conradi Smith GD, Del Negro CA. **&mu;-opioid receptor signaling enhances Kir3 currents in glutamatergic preB<span class="kbd">ö</span>tzinger complex neurons.** Under review at *J. Physiol.*

Cooley AM, Schlutius C, Matthews M, <span style="text-decoration:underline">Simmons E</span>, Zheng X, Thomas D, Edger PP, Platts AE, LaFountain A, George L, Williams A, Hundley D, Conradi Smith GD, Yuan Y-W, Twyford A and Puzey JR. **Genetic architectures of floral pigment and patterning in hybrid monkeyflowers.** Under review at *Genetics*.

<span style="text-decoration:underline">Borrus DS</span>, Stettler MK, <span style="text-decoration:underline">Grover CJ</span>, <span style="text-decoration:underline">Kalajian EJ</span>, Gu J, Conradi Smith GD\*, Del Negro CA\*. **Inspiratory and sigh breathing rhythms depend on distinct cellular signaling mechanisms in the preB<span class="kbd">ö</span>tzinger complex.** *The Journal of Physiology (London)* 602:809-834, 2024. [\[10.1113/JP285582\]](https://physoc.onlinelibrary.wiley.com/doi/10.1113/JP285582) \*Contributed equally.

<span style="text-decoration:underline">Simmons ESG</span>, Cooley AM, Puzey JR, Conradi Smith GD. **A multigenerational Turing model reproduces transgressive petal spot phenotypes in hybrid *Mimulus*.** *Bulletin of Mathematical Biology* 85:120, 2023. [\[10.1007/s11538-023-01223-7\]](https://link.springer.com/article/10.1007/s11538-023-01223-7)`;

const newBooks = String.raw`Conradi Smith GD. **Receptor Modeling Jupyter Book.** 2025. [Jupyter Book](https://gregconradismith.github.io/receptor-modeling-jupyter-book/intro.html)

Exposition of how cell surface receptors can be modeled using Sagemath, an open-source mathematics software system. The focus is on algebraic analysis of conformational coupling in oligomeric receptor models. An unrefereed deliverable supported by NSF DMS grant #1951646, *Cycle representations of receptor complex signal transduction.*`;

function addNewBooks(content) {
  const marker = "### Books";

  if (!content.includes(marker)) {
    throw new Error("Could not find Books heading in publications content.");
  }

  return content.replace(marker, `${marker}\n\n${newBooks}`);
}

function addNewPublications(content) {
  const marker =
    "*Note that Conradi Smith GD = Smith GD (my name changed in 2017). Students and research associates who were under my supervision are <span style=\"text-decoration:underline\">underlined</span>. \\*These authors contributed equally.*";

  if (!content.includes(marker)) {
    throw new Error("Could not find Research Articles note in publications content.");
  }

  return content.replace(marker, `${marker}\n\n${newPublications}`);
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), `${tidy(content)}\n`, "utf8");
}

function removeFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

function frontMatter(data) {
  return [
    "---",
    ...Object.entries(data).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return [`${key}:`, ...value.map((item) => `  - ${item}`)];
      }
      return `${key}: ${value}`;
    }),
    "---",
    "",
  ].join("\n");
}

const jamesQuote = `> As for me, my bed is made: I am against bigness and greatness in all their forms, and with the invisible molecular forces that work from individual to individual, stealing through the crannies of the world like so many soft rootlets, or like the capillary oozing of water, and yet rending the hardest monuments of men's pride, if you give them time.
>
> The bigger the unit you deal with, the hollower, the more brutal, the more mendacious is the life displayed.
>
> So I am against all big organizations as such, national ones first and foremost; against all big successes and big results; and in favor of the eternal forces of truth which always work in the individual and immediately unsuccessful way, under-dogs always, till history comes, long after they are dead, and puts them on the top.
>
> William James  
> Letter to Mrs. Henry Whitman  
> June 7, 1899`;

writeFile(
  "_pages/about.md",
  `${frontMatter({
    permalink: "/",
    title: '"Greg Conradi Smith"',
    author_profile: true,
    redirect_from: ["/about/", "/about.html"],
  })}

I am a professor in the Department of Applied Science at William & Mary with research interests in mathematical aspects of cell biology and neuroscience.

My work uses mathematical and computational models to connect cellular mechanisms with experimentally observed biological function, especially in calcium signaling, excitable cells, and computational neuroscience. I often collaborate closely with physiologists to build models of experimental preparations, use those models to make explicit predictions, and test those predictions against future experiment.

[Read more about my research](/research/) or browse my [publications](/publications/).

[Innovating research and education: W&M professor and students address issues of science and society](https://news.wm.edu/2023/11/16/innovating-research-and-education-wm-professor-and-students-address-issues-of-science-and-society/)

${jamesQuote}`
);

writeFile(
  "_pages/research.md",
  `${frontMatter({
    layout: "single",
    title: '"Research"',
    permalink: "/research/",
    author_profile: true,
  })}${convert(page("what-i-do-at-wm").content, "gfm")}`
);

writeFile(
  "_pages/positions.md",
  `${frontMatter({
    layout: "single",
    title: '"Positions"',
    permalink: "/positions/",
    author_profile: true,
  })}${convert(page("positions").content, "gfm")}`
);

writeFile(
  "_pages/statement.md",
  `${frontMatter({
    layout: "single",
    title: '"Statement"',
    permalink: "/statement/",
    author_profile: true,
  })}${convert(page("statement").content, "gfm")}`
);

writeFile(
  "_pages/blogs.md",
  `${frontMatter({
    layout: "single",
    title: '"Blogs"',
    permalink: "/blogs/",
    author_profile: true,
  })}${convert(page("blogs-2").content, "gfm")}`
);

const teachingContent = `${frontMatter({
  layout: "single",
  title: '"Teaching"',
  permalink: "/teaching/",
  author_profile: true,
})}### Courses and Materials

- [Cellular Biophysics and Modeling book](https://doi.org/10.1017/9780511793905)
- [Cellular Biophysics and Modeling course](https://cellularbiophysicsandmodeling.wordpress.com/)
- [Computational Neuroscience](https://apsc450computationalneuroscience.wordpress.com/)
- [Science & Authority](https://scienceauthority.wordpress.com/)
- [Matroids one-page PDF](https://gregconradismith.wordpress.com/wp-content/uploads/2023/01/matroids_onepage.pdf)

${convert(page("cshl-summer-school").content, "gfm")}`;

writeFile("_pages/teaching.md", teachingContent);
removeFile("_pages/teaching.html");

writeFile(
  "_pages/publications.md",
  `${frontMatter({
    layout: "single",
    title: '"Publications"',
    permalink: "/publications/",
    author_profile: true,
  })}{% if site.author.googlescholar %}
You can also find my articles on [Google Scholar]({{ site.author.googlescholar }}){% if site.author.pubmed %} and [PubMed]({{ site.author.pubmed }}){% endif %}.
{% endif %}

${addNewPublications(addNewBooks(removeWordPressButtonBlocks(convert(page("publications").content, "gfm"))))}`
);
removeFile("_pages/publications.html");

const mathy = post("have-a-mathy-christmas");
writeFile(
  "_posts/2018-12-06-have-a-mathy-christmas.md",
  `${frontMatter({
    title: '"Have a Mathy Christmas!"',
    date: '"2018-12-06 17:37:07 -0500"',
    categories: "[personal]",
    tags: "[mathematics]",
    redirect_from: ["/2018/12/06/have-a-mathy-christmas/"],
  })}

${convert(mathy.content, "gfm")}`
);
