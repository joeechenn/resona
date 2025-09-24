import cover from "/resonacover.jpg";
import homepage from "/examplehomepage.png"
import { Github } from "lucide-react";

export const Resona = () => {
  return (
  <main className="min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-4">
          Resona
        </h1>
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
        <span className="text-primary">Rate. Rank. Rediscover.</span>
        </h2>
        <p className="text-md leading-relaxed mb-8">
            Find your sound. Share your hot takes. See who resonates with you — or who doesn't.
        </p>
        <div className="mx-auto max-w-xs">
        <img 
        src={cover}
        className="w-full h-auto rounded-lg mb-4"
        />
        </div>
        <section className="mt-8 text-left space-y-4 max-w-3xl mx-auto">
            <h2 className="text-center text-2xl font-bold mb-4">The Idea</h2>
            <p className="text-muted-foreground leading-relaxed">
                <span className="text-white font-semibold">Music </span>
                has always been one of the greatest forms of art. Its value doesn't
                come only from its production or lyricism, but from the social process around it: 
                the
                <span className="text-white font-semibold"> conversations,</span>
                <span className="text-white font-semibold"> debates, </span>
                and
                <span className="text-white font-semibold"> shared experiences </span>
                that give music its meaning and influence.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                Opinions on music are never fixed. A song that feels generational to one listener
                might feel overrated, or straight up
                <span className="text-white font-semibold"> "mid" </span>
                to another. What makes the culture surrounding music so alive is this
                constant push and pull of opinions, the joy of discovering where your
                tastes align, and where they don't.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                Think of 
                <span className="text-white font-semibold"> Resona </span> 
                as a Beli-like music
                analytics and social discovery app. In Resona, you can keep track of your
                own favorites or what others think of your hot takes. You'll better understand 
                your own music taste, explore how others experience music, and find people 
                who resonate with you… or don't.
             </p>
             <img 
             src={homepage}
             className="w-full h-auto rounded-lg mb-2 mt-8"
             />
            <p className="text-center mt-2 text-xs text-muted-foreground">
                Idea of homepage made with Figma
            </p>
            <p className="text-left mt-8 space-y-4 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
                The homepage brings everything together: an 
                <span className="text-white font-semibold"> Analytics </span> 
                summary-like sidebar  with insights like your top genre, uniqueness
                score, and recent favorites; a central 
                <span className="text-white font-semibold"> Feed </span> 
                where you and your friends rank songs, albums, and share hot 
                takes; and a 
                <span className="text-white font-semibold"> Stats </span> 
                panel that tracks your weekly activity alongside a 
                <span className="text-white font-semibold"> Friend Activity </span> 
                section showing what others are listening to and rating in real time.
            </p>
            <p className="text-center text-white font-bold mt-16 mb-16 space-y-4 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
                Upcoming features include deeper analytics, taste-matching with friends and others, and customizable music profiles. 
                More details and information coming soon…
            </p>
        </section>
      </div>
      <footer className="py-8">
        <a
          href="https://github.com/yourusername/resona"
          target="_blank"
          rel="noreferrer"
          className="flex justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <Github size={28} />
        </a>
      </footer>

    </main>
  );
}