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

const researchPage = `${frontMatter({
  layout: "single",
  title: '"Research"',
  permalink: "/research/",
  author_profile: true,
})}![The Computational Biology Lab at William & Mary](https://wmcbl.wordpress.com/wp-content/uploads/2024/06/logo.png?w=906)

The Computational Biology Lab at William & Mary is a studio for mathematical aspects of life science. The lab applies mathematics, computation, and data science to biological questions in computational neuroscience, cell physiology, calcium signaling, quantitative pharmacology, pattern formation, and genomics.

We are life scientists and neuroscientists, and also interdisciplinary applied mathematicians. Our work uses differential equations, probability, high-performance computing, and practical data science methods to connect mechanistic models with biological function. Students in the lab work at the intersection of applied mathematics, biology, data science, and bioengineering.

Graduate students in the Computational Biology Lab are members of William & Mary's [Department of Applied Science](https://www.wm.edu/as/appliedscience/). Undergraduate researchers affiliated with the lab often major in [Mathematics](https://www.wm.edu/as/mathematics/), [Neuroscience](https://www.wm.edu/as/neuroscience/), or [CAMS Mathematical Biology](https://www.wm.edu/as/cams/mathematical-biology/).

The lab is closely connected with William & Mary's biomathematics community, including the [Biomath Seminar](https://wmbiomath.wordpress.com) and the [Data Science Program](https://www.wm.edu/as/data-science/).

### Projects

- [Receptor Oligomers](/research/receptor-oligomers/)
- [Eupnea & Sigh](/research/eupnea-sigh/)
- [Petal Patterns](/research/petal-patterns/)
- [Calcium Dynamics](https://wmcbl.wordpress.com/intracellular-calcium-dynamics/)
- [Visual Thalamus](https://wmcbl.wordpress.com/visual-thalamus/)

For more lab information, see [The Conradi Smith Lab](https://wmcbl.wordpress.com/).`;

const receptorOligomersPage = `${frontMatter({
  layout: "single",
  title: '"Receptor Oligomers"',
  permalink: "/research/receptor-oligomers/",
  author_profile: true,
})}Cell surface receptors detect chemical signals outside a cell and translate them into intracellular responses. Many important receptors are not single independent switches, but multi-subunit molecular machines whose parts interact with one another. Mathematical models are therefore essential for understanding how receptor structure, ligand binding, subunit state, and allosteric coupling shape cell behavior.

Our work develops mathematical and biophysical theory for receptor oligomers, with an emphasis on how receptor function emerges from protein subunits and the energetic interactions between them. This provides a framework for interpreting natural cell signaling and for building quantitative models that may inform pharmacology and drug development.

### Cycle Representations

The lab's work on cycle bases of product graphs gives a systematic way to enumerate conformational coupling in receptor dimers and higher-order oligomers. Starting from a hypothesized monomer state-transition diagram, the product-graph formalism helps identify the thermodynamic constraints that appear in the oligomer and gives each allosteric parameter a physical interpretation.

Current work extends this framework to receptor complexes, including dimeric G-protein-coupled receptors and receptor tyrosine kinases. Software for receptor oligomer analysis is being developed for quantitative pharmacologists and other life scientists, with longer-term interest in non-equilibrium phenomena such as nucleotide exchange.

### Publications

- Conradi Smith GD. **Allostery in oligomeric receptor models.** *Mathematical Medicine and Biology: A Journal of the IMA* 37:313-333, 2020. [[10.1093/imammb/dqz016](https://doi.org/10.1093/imammb/dqz016)] [[BioRxiv preprint](https://www.biorxiv.org/content/10.1101/330571v2)]
- Hammack RH and Smith GD. **Cycle bases of reduced powers of graphs.** *ARS Mathematica Contemporanea* 12(1):183-203, 2017. [[journal](https://amc-journal.eu/index.php/amc/article/view/856)] [[arXiv preprint](https://arxiv.org/abs/1601.02896)]

### Funding

National Science Foundation, Division of Mathematical Sciences, Mathematical Biology. **Cycle representations of receptor complex signal transduction.** PI: Gregory D. Conradi Smith. NSF DMS-1951646, 6/20-5/23.

See also the original [Receptor Oligomers project page](https://wmcbl.wordpress.com/receptor-oligomers/).`;

const eupneaSighPage = `${frontMatter({
  layout: "single",
  title: '"Eupnea & Sigh"',
  permalink: "/research/eupnea-sigh/",
  author_profile: true,
})}Joint work with [Christopher A. Del Negro](https://people.wm.edu/~cadeln/).

In collaboration with Del Negro and jointly mentored graduate students, we are developing biologically realistic mathematical models of the neural origins of breathing behavior. Under normal physiological conditions, breathing consists of **eupnea**, the periodic pumping movements that ventilate the lung for gas exchange, and **sighs**, larger but less frequent breaths that optimize gas exchange efficiency or express emotion.

Even though their frequencies differ by orders of magnitude, eupnea- and sigh-related rhythms originate in the preBötzinger Complex (preBötC), a specialized medullary site that is necessary and sufficient to generate breathing movements *in vivo*. Analogous motor output pertaining to eupnea and sigh can be recorded from slice preparations that retain the preBötC and hypoglossal (XII) motoneurons, which have inspiratory function.

Slices encapsulate a complete breathing microcircuit that generates eupnea and sigh, which is experimentally advantageous for interrogating rhythmogenic mechanisms *in vitro*. The overall aim of this project is to determine the cellular and synaptic mechanisms of eupnea and sigh rhythms, using a combination of modeling and experiment, with a focus on the neural mechanisms that couple these rhythms.

### News

- ["That was terrifying:" Ph.D. student begins research career by unsettling "settled science"](https://www.wm.edu/as/appliedscience/news/that-was-terrifying-ph.d.-student-begins-research-career-by-unsettling-settled-science.php), by Joseph McClain.

### Prior Work

- <span style="text-decoration:underline">Borrus D</span>, <span style="text-decoration:underline">Grover C</span>, Conradi Smith GD, Del Negro CA. **The preBötzinger complex generates sigh rhythm via intracellular calcium oscillations in mice.** In preparation, 2021.
- Kallurkar PS, Picardo MCD, Sugimura YK, Saha MS, Conradi Smith GD, Del Negro CA. **Transcriptomes of electrophysiologically recorded Dbx1-derived respiratory neurons of the preBötzinger complex in neonatal mice.** Submitted to *Genome Biology*. [[BioRxiv preprint](https://doi.org/10.1101/2021.08.01.454659)]
- <span style="text-decoration:underline">Borrus D</span>, Conradi Smith GD, Del Negro CA. **Role of synaptic inhibition in the coupling of the respiratory rhythms that underlie eupnea and sigh behaviors.** *eNeuro* 7(3):1-20, 2020. [[10.1523/ENEURO.0302-19.2020](https://doi.org/10.1523/ENEURO.0302-19.2020)] [[PMID:32393585](https://www.ncbi.nlm.nih.gov/pubmed/32393585)]

### Funding

National Center for Complementary & Integrative Health (NCCIH), joint NSF-NIH program Collaborative Research in Computational Neuroscience (CRCNS). **Discovering the neural mechanisms of breathing rhythms - eupnea and sigh.** PIs: Christopher Del Negro and Greg Conradi Smith. 1R01AT01816-01. 8/19-7/22.

See also the original [Eupnea & Sigh project page](https://wmcbl.wordpress.com/eupnea-sigh/).`;

const petalPatternsPage = `${frontMatter({
  layout: "single",
  title: '"Petal Patterns"',
  permalink: "/research/petal-patterns/",
  author_profile: true,
})}Joint work with [Joshua Puzey](https://puzeylab.weebly.com/) and [Arielle Cooley](https://people.whitman.edu/~cooleyam/) at [Whitman College](https://www.whitman.edu/).

Life on earth exhibits a dazzling array of patterns, from internal repeated structures such as vertebrae to external pigment patterns such as stripes. Two broad ideas explain how these patterns can form. In a **positional specification** model, genes are turned on in specific locations in a controlled fashion. In a **reaction-diffusion** model, patterns arise from a self-organizing system of interacting genes, where random fluctuations in one gene's activity can be amplified by the response of other genes in the network.

Petal spots in the monkeyflower genus *Mimulus* appear to depend on both positional specification and reaction-diffusion mechanisms. This project uses the petal-spot system to study how those mechanisms interact to create new and complex patterns in nature.

Previous work in *Mimulus* established that nectar-guide spots of red anthocyanin pigment form in a way that is consistent with a reaction-diffusion system. The discovery of elaborate spot patterns in petal lobes of *Mimulus cupreus* x *M. luteus* var. *variegatus* hybrids creates an opportunity to ask whether this reaction-diffusion system explains floral patterning more generally, whether positional cues from petal vasculature shape these patterns, and how hybridization can generate novel phenotypes absent from either parent species.

The project develops reaction-diffusion models that reproduce anthocyanin spotting phenotypes observed in hybrid genetic mapping populations. These models are tested against homozygous genotypes in Recombinant Inbred Lines and against experiments that alter expression of key genes in the anthocyanin regulatory network. A related aim is to determine whether petal vasculature influences spot location using digital image analysis, spatial statistics, and experimental perturbations of vein development.

### Prior Work

- Kinser TJ, Smith RD, Lawrence AH, Cooley AM, Vallejo-Marin M, Conradi Smith GD, and Puzey JR. **Mechanisms driving endosperm-based hybrid incompatibilities: insights from hybrid monkeyflowers.** *Plant Cell*. [[10.1105/tpc.17.00010](https://doi.org/10.1105/tpc.17.00010)] [[BioRxiv preprint](https://doi.org/10.1101/461939)]
- Zheng X, Om K, Stanton KA, Thomas D, Schlutius C, Cheng PA, Eggert A, Simmons E, Yuan Y-W, Conradi Smith GD, Puzey JR\\*, Cooley AM\\*. **MYB5a/NEGAN activates petal anthocyanin pigmentation and shapes the MBW regulatory network in *Mimulus luteus* var. *variegatus*.** *Genetics*. [[10.1093/genetics/iyaa036](https://doi.org/10.1093/genetics/iyaa036)]
- Smith RD, Kinser TJ, Conradi Smith GD and Puzey JR. **A likelihood ratio test for changes in homeolog expression bias.** *BMC Bioinformatics* 20:149, 2019. [[doi:10.1186/s12859-019-2709-5](https://doi.org/10.1186/s12859-019-2709-5)] [[PMID:30894122](https://www.ncbi.nlm.nih.gov/pubmed/30894122)] [[BioRxiv preprint](https://doi.org/10.1101/119438)]
- Edger PP, Smith RD, McKain MR, Cooley AM, Vallejo-Marin M, Yuan Y, Bewick AJ, Ji L, Platts AE, Bowman MJ, Childs KL, Schmitz RJ, Smith GD, Pires JC, Puzey JR. **Subgenome dominance in an interspecific hybrid, synthetic allopolyploid, and a 140 year old naturally established neo-allopolyploid monkeyflower.** *The Plant Cell* 29(9):2150-2167, 2017. [[doi:10.1105/tpc.17.00010](http://dx.doi.org/10.1105/tpc.17.00010)] [[PMID:28814644](https://www.ncbi.nlm.nih.gov/pubmed/28814644)]

### Further Reading

- [Monkeyflowers as a Model System](https://monkeyflower.uconn.edu/) by Yaowu Yuan at the University of Connecticut
- [Mimubase](https://mimubase.org/)

See also the original [Petal Patterns project page](https://wmcbl.wordpress.com/petal-patterns/).`;

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

writeFile("_pages/research.md", researchPage);
writeFile("_pages/receptor-oligomers.md", receptorOligomersPage);
writeFile("_pages/eupnea-sigh.md", eupneaSighPage);
writeFile("_pages/petal-patterns.md", petalPatternsPage);

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
