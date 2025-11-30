
import { Target, Users, Lightbulb } from "lucide-react";


const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground"> 
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-center text-4xl font-bold">About Nani Creations</h1>
          
          <div className="mb-12 animate-fade-in rounded-lg border border-border bg-card p-8">
            <p className="mb-4 text-lg text-muted-foreground">
              Nani Creations Hub is your premier destination for robotics, electronics, and innovative learning. 
              We're passionate about empowering students, makers, and educators with the tools and knowledge to 
              bring their ideas to life.
            </p>
            <p className="text-lg text-muted-foreground">
              Founded in 2020, we've helped thousands of learners worldwide discover the joy of creating, 
              building, and programming electronic projects. From beginners taking their first steps in 
              Arduino to advanced makers developing complex IoT systems, we provide the resources and 
              support you need to succeed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="animate-scale-in rounded-lg border border-border bg-card p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">Our Mission</h3>
              <p className="text-muted-foreground">
                To make electronics and robotics education accessible, affordable, and enjoyable for everyone.
              </p>
            </div>

            <div className="animate-scale-in rounded-lg border border-border bg-card p-6 text-center" style={{ animationDelay: "0.1s" }}>
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">Innovation</h3>
              <p className="text-muted-foreground">
                We curate the latest and most innovative products to keep you at the cutting edge of technology.
              </p>
            </div>

            <div className="animate-scale-in rounded-lg border border-border bg-card p-6 text-center" style={{ animationDelay: "0.2s" }}>
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">Community</h3>
              <p className="text-muted-foreground">
                Join a vibrant community of makers, learners, and innovators sharing knowledge and projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;